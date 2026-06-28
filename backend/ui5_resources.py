#!/usr/bin/env python3
"""
ui5_resources.py
================
Fetches the full library metadata for a given UI5 version from ui5.sap.com
and saves the enriched result to ui5/version/<version>.json.

Usage
-----
    python ui5_resources.py 1.145.3
    python ui5_resources.py ALL
    python ui5_resources.py ALL --force
    python ui5_resources.py --version 1.145.3 --output ./my_cache

Requirements
------------
    pip install requests          # stdlib xml.etree.ElementTree is used for XML
"""

import argparse
import json
import os
import re
import sys
import xml.etree.ElementTree as ET
from concurrent.futures import ThreadPoolExecutor, as_completed

import requests

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

BASE_URL    = "https://ui5.sap.com"
MAX_WORKERS = 10   # parallel .library fetches per version
TIMEOUT     = 15   # seconds per request

SESSION = requests.Session()
SESSION.headers.update({"Accept": "application/json, text/xml, */*"})


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def fetch_json(url: str) -> dict:
    """GET *url* and return parsed JSON, raising on HTTP/network errors."""
    resp = SESSION.get(url, timeout=TIMEOUT)
    resp.raise_for_status()
    return resp.json()


def fetch_text(url: str) -> str | None:
    """GET *url* and return response text, or None on any error."""
    try:
        resp = SESSION.get(url, timeout=TIMEOUT)
        resp.raise_for_status()
        return resp.text
    except Exception as exc:
        print(f"  [WARN] {url}: {exc}", file=sys.stderr)
        return None


def extract_xml_text(element: ET.Element | None) -> str | None:
    """Return stripped text content of an XML element, or None."""
    if element is None:
        return None
    return (element.text or "").strip() or None


def parse_library_xml(xml_text: str) -> dict:
    """
    Parse a .library XML file and extract:
      vendor, copyright, documentation, appData
    """
    result = {"vendor": None, "copyright": None, "documentation": None, "appData": None}

    try:
        # Strip XML namespaces to simplify tag matching
        cleaned = re.sub(r'\s+xmlns(?::\w+)?="[^"]+"', "", xml_text)
        root = ET.fromstring(cleaned)
    except ET.ParseError as exc:
        print(f"  [WARN] XML parse error: {exc}", file=sys.stderr)
        return result

    def find_text(tag: str) -> str | None:
        el = root.find(f".//{tag}")
        return extract_xml_text(el)

    result["vendor"]        = find_text("vendor")
    result["copyright"]     = find_text("copyright")
    result["documentation"] = find_text("documentation")

    app_data_el = root.find(".//appData")
    if app_data_el is not None:
        result["appData"] = ET.tostring(app_data_el, encoding="unicode").strip()

    return result


def enrich_library(version: str, lib: dict) -> dict:
    """
    Fetch the .library file for *lib* and merge its metadata into the dict.
    """
    lib_path = lib["name"].replace(".", "/")          # sap.ui.core → sap/ui/core
    url      = f"{BASE_URL}/{version}/resources/{lib_path}/.library"

    xml_text = fetch_text(url)
    if xml_text:
        lib.update(parse_library_xml(xml_text))
    else:
        lib.update({"vendor": None, "copyright": None, "documentation": None, "appData": None})

    return lib


# ---------------------------------------------------------------------------
# Core logic
# ---------------------------------------------------------------------------

def build_resources(version: str) -> dict:
    """
    1. Fetch sap-ui-version.json for *version*.
    2. Enrich every library entry with .library metadata.
    3. Return the merged dict.
    """
    version_url = f"{BASE_URL}/{version}/resources/sap-ui-version.json"
    print(f"[INFO] Fetching {version_url} …")
    sap_ui_version = fetch_json(version_url)

    libraries = sap_ui_version.get("libraries", [])
    print(f"[INFO] Enriching {len(libraries)} libraries (up to {MAX_WORKERS} in parallel) …")

    enriched = [None] * len(libraries)

    with ThreadPoolExecutor(max_workers=MAX_WORKERS) as executor:
        future_to_idx = {
            executor.submit(enrich_library, version, dict(lib)): idx
            for idx, lib in enumerate(libraries)
        }
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            try:
                enriched[idx] = future.result()
            except Exception as exc:
                print(f"  [ERROR] Library #{idx}: {exc}", file=sys.stderr)
                enriched[idx] = libraries[idx]   # fall back to raw entry

    sap_ui_version["libraries"] = enriched
    return sap_ui_version


def save_result(data: dict, version: str, output_dir: str) -> str:
    """Write *data* as JSON to <output_dir>/<version>.json, return the path."""
    os.makedirs(output_dir, exist_ok=True)
    out_path = os.path.join(output_dir, f"{version}.json")
    with open(out_path, "w", encoding="utf-8") as fh:
        json.dump(data, fh, ensure_ascii=False, indent=2)
    return out_path


def process_version(version: str, output_dir: str, force: bool = False) -> bool:
    """
    Fetch, enrich and save a single version.
    Returns True on success, False on error.
    Skips (returns True) if cache exists and force=False.
    """
    cache_path = os.path.join(output_dir, f"{version}.json")
    if os.path.isfile(cache_path) and not force:
        print(f"[SKIP] {version} — already cached ({cache_path})")
        return True

    try:
        data      = build_resources(version)
        out_path  = save_result(data, version, output_dir)
        lib_count = len(data.get("libraries", []))
        print(f"[OK] {version} — {lib_count} libraries → {out_path}")
        return True
    except requests.HTTPError as exc:
        print(f"[ERROR] {version} — HTTP {exc}", file=sys.stderr)
    except requests.ConnectionError as exc:
        print(f"[ERROR] {version} — connection error: {exc}", file=sys.stderr)
    except Exception as exc:
        print(f"[ERROR] {version} — {exc}", file=sys.stderr)
    return False


def process_all(output_dir: str, force: bool = False) -> None:
    """
    Fetch versionoverview.json, collect every patches[].version that matches
    x.y.z format, then process each one sequentially.
    """
    overview_url = f"{BASE_URL}/versionoverview.json"
    print(f"[INFO] Fetching version list from {overview_url} …")

    try:
        overview = fetch_json(overview_url)
    except Exception as exc:
        print(f"[ERROR] Cannot fetch versionoverview.json: {exc}", file=sys.stderr)
        sys.exit(1)

    patches = overview.get("patches", [])
    versions = [
        p["version"] for p in patches
        if re.fullmatch(r"\d+\.\d+\.\d+", p.get("version", ""))
    ]

    if not versions:
        print("[ERROR] No valid patch versions found in versionoverview.json", file=sys.stderr)
        sys.exit(1)

    total   = len(versions)
    ok      = 0
    skipped = 0
    errors  = 0

    print(f"[INFO] {total} patch versions found.\n")

    for idx, version in enumerate(versions, 1):
        cache_path = os.path.join(output_dir, f"{version}.json")
        if os.path.isfile(cache_path) and not force:
            print(f"[{idx}/{total}] SKIP {version} (cached)")
            skipped += 1
            continue

        print(f"[{idx}/{total}] Processing {version} …")
        if process_version(version, output_dir, force=True):  # force=True: cache check already done above
            ok += 1
        else:
            errors += 1

    print(f"\n{'─'*50}")
    print(f"[DONE] {ok} saved, {skipped} skipped (cached), {errors} errors  (total: {total})")


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Fetch and enrich UI5 library metadata from ui5.sap.com.\n\n"
            "  python ui5_resources.py 1.145.3       # single version\n"
            "  python ui5_resources.py ALL            # all patches from versionoverview.json\n"
            "  python ui5_resources.py ALL --force    # re-fetch even cached versions"
        ),
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument(
        "version",
        nargs="?",
        help='UI5 version (e.g. 1.145.3) or ALL.',
    )
    parser.add_argument(
        "--version", "-v",
        dest="version_flag",
        metavar="VERSION",
        help="UI5 version or ALL (alternative to positional argument).",
    )
    parser.add_argument(
        "--output", "-o",
        default=os.path.join("ui5", "version"),
        metavar="DIR",
        help="Output directory (default: ./ui5/version).",
    )
    parser.add_argument(
        "--force", "-f",
        action="store_true",
        help="Re-fetch and overwrite existing cache files.",
    )
    return parser.parse_args()


def main() -> None:
    args    = parse_args()
    version = args.version or args.version_flag

    if not version:
        print(
            "[ERROR] Please provide a version or ALL.\n"
            "  Examples:\n"
            "    python ui5_resources.py 1.145.3\n"
            "    python ui5_resources.py ALL",
            file=sys.stderr,
        )
        sys.exit(1)

    # ── ALL mode ──────────────────────────────────────────────────────────────
    if version.upper() == "ALL":
        process_all(args.output, force=args.force)
        return

    # ── Single version mode ───────────────────────────────────────────────────
    if not re.fullmatch(r"\d+\.\d+\.\d+", version):
        print(
            f"[ERROR] Invalid version '{version}'. Expected x.y.z (e.g. 1.145.3) or ALL.",
            file=sys.stderr,
        )
        sys.exit(1)

    cache_path = os.path.join(args.output, f"{version}.json")
    if os.path.isfile(cache_path) and not args.force:
        print(f"[INFO] Already cached: {cache_path}  (use --force to refresh)")
        sys.exit(0)

    if not process_version(version, args.output, force=args.force):
        sys.exit(1)


if __name__ == "__main__":
    main()
