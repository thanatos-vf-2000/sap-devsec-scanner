<template>
  <div v-if="!data" class="empty">Aucune donnée UI5</div>
  <div v-else>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <!-- Left: detected version + sources -->
      <div>
        <div class="font-bold mb-8"><i class="fa-regular fa-file-lines"></i> {{ t.report.ui5.detectedVersion }}</div>
        <div style="padding:16px;background:#f7f7f7;border:1px solid #ddd;border-radius:4px">
          <div  v-if="data.detectedVersion" 
                style="font-size:24px;font-weight:700;color:#0f2d5b" 
                @click="goUI5(data.detectedVersion)" >
                  {{ data.detectedVersion }}
          </div>
          <div v-else style="color:#999">{{ t.report.ui5.notDetected }}</div>
          <div style="margin-top:8px;font-size:12px">
            <div><i class="fa-regular fa-star"></i> {{ t.report.ui5.lts }} <strong>{{ data.ltsVersion }}</strong></div>
            <div><i class="fa-solid fa-star-of-life"></i> {{ t.report.ui5.latest }} <strong>{{ data.latestVersion }}</strong></div>
          </div>
        </div>

        <div class="font-bold mb-8 mt-16"><i class="fa-solid fa-magnifying-glass"></i> {{ t.report.ui5.sources }}</div>
        <ul style="list-style:none">
          <li v-for="(s, i) in data.sources" :key="i" style="padding:4px 0;border-bottom:1px solid #eee;font-size:12px">
            <span style="font-weight:500">{{ s.file }}</span> - {{ s.key }}: <code style="background:#f0f0f0;padding:1px 4px">{{ s.value }}</code>
          </li>
          <li v-if="!data.sources?.length" class="text-gray">{{ t.report.ui5.noSources }}</li>
        </ul>
        <div style="margin-top:12px">
          <a href="https://ui5.sap.com/versionoverview.html" target="_blank" class="btn btn-ghost btn-sm"><i class="fa-brands fa-sourcetree"></i> {{ t.report.ui5.officialVersions }}</a>
        </div>
      </div>

      <!-- Right: version table -->
      <div>
        <div class="font-bold mb-8"><i class="fa-solid fa-arrow-up-right-dots"></i> {{ data.source !== 'static'
              ? t.report.ui5.versionTableSAP(data.source)
              : t.report.ui5.versionTable(data.versionDate)
          }}
        </div>
        <table class="version-table">
          <thead>
            <tr>
              <th>{{ t.report.ui5.version }}</th>
              <th>{{ t.report.ui5.status }}</th>
              <th>{{ t.report.ui5.endMaintenance }}</th>
              <th>{{ t.report.ui5.endCloud }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(v, i) in sortedVersionRows"
              :key="i"
              :class="[v.isCurrent ? 'current' : '', `version-row-${v.effectiveStatus}`]"
            >
              <td>
                <div>
                  <strong v-if="v.isCurrent">{{ v.version }}</strong>
                  <span v-else>{{ v.version }}</span>
                  <span v-if="v.isCurrent"> <i class="fa-solid fa-left-long"></i> {{ t.report.ui5.yourVersion }}</span>
                </div>
                <!-- Patches displayed as small condensed badges -->
                <div v-if="v.patches?.length" style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px">
                  <code
                    v-for="(p, pi) in v.patches"
                    :key="pi"
                    style="font-size:10px;background:#f0f0f0;padding:1px 4px;border-radius:3px;color:#555"
                  >{{ p }}</code>
                </div>
              </td>
              <td>
                <i class="fa-solid" :class="v.statusIcon"></i>
                {{ v.effectiveLabel }}
              </td>
              <td v-html="v.eomLabel"></td>
              <td v-html="v.ecpLabel"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="font-bold mb-8"><i class="fa-solid fa-triangle-exclamation"></i> {{ t.report.ui5.issues }}</div>
    <IssuesTable :issues="allIssues" :empty-msg="`${t.report.ui5.noIssues}`" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { t } from '../../i18n/index.js';
import IssuesTable from '../IssuesTable.vue';

import { useRouter } from 'vue-router';



function quarterToMonth(q) {
  return { Q1: '03', Q2: '06', Q3: '09', Q4: '12' }[q];
}

function parseQuarterDate(value) {
  if (!value) return null;
  const match = value.match(/(Q[1-4])\/(\d{4})/);
  if (!match) return null;
  return new Date(`${match[2]}-${quarterToMonth(match[1])}-01`);
}

/**
 * Compare two "major.minor" version strings numerically.
 * Returns positive if a > b, negative if a < b, 0 if equal.
 */
function compareMajorMinor(a, b) {
  const [aMaj, aMin] = a.split('.').map(Number);
  const [bMaj, bMin] = b.split('.').map(Number);
  if (aMaj !== bMaj) return aMaj - bMaj;
  return aMin - bMin;
}

export default {
  name: 'UI5Tab',
  components: { IssuesTable },
  props: { data: { type: Object, default: null } },
  setup(props) {
    const today = new Date();

    const router = useRouter();

    function goUI5(version) {
      if (!version) return

      const route = router.resolve({
        name: 'UI5',
        params: { version }
      })

      window.open(route.href, '_blank')
    }

    const sortedVersionRows = computed(() => {
      if (!props.data?.versionTable) return [];

      // ── 1. Sort all entries descending by version then patch ──────────────
      const allVersions = [...props.data.versionTable].sort((a, b) => {
        const vCmp = b.version.localeCompare(a.version, undefined, { numeric: true });
        if (vCmp !== 0) return vCmp;
        return (b.patch ?? '').localeCompare(a.patch ?? '', undefined, { numeric: true });
      });

      // ── 2. Group by version + eom + ecp (collapse identical rows) ─────────
      const grouped = [];
      for (const v of allVersions) {
        const last = grouped[grouped.length - 1];
        if (
          last &&
          last.version === v.version &&
          last.eom === v.eom &&
          last.ecp === v.ecp &&
          last.status === v.status
        ) {
          if (v.patch) last.patches.push(v.patch);
        } else {
          grouped.push({
            version: v.version,
            status: v.status,
            eom: v.eom,
            ecp: v.ecp,
            label: v.label,
            patches: v.patch ? [v.patch] : [],
          });
        }
      }

      // ── 3. Identify the current major.minor ───────────────────────────────
      const currentMajor = props.data.detectedVersion
        ? props.data.detectedVersion.split('.').slice(0, 2).join('.')
        : null;

      // ── 4. Filter: keep LTS, current version, and at most N-3 recent ones ─
      //   "Recent" = sorted desc; we keep up to 3 versions counting from the
      //   most recent, regardless of their LTS status.
      const MAX_NON_LTS = 3;

      // Collect unique major.minor versions in descending order
      const uniqueMajors = [...new Set(grouped.map(g => g.version.split('.').slice(0, 2).join('.')))];
      // uniqueMajors is already desc because grouped is sorted desc
      const recentMajors = new Set(uniqueMajors.slice(0, MAX_NON_LTS));

      const filtered = grouped.filter(g => {
        const majorMinor = g.version.split('.').slice(0, 2).join('.');
        const isLts = g.status === 'lts';
        const isCurrent = currentMajor && majorMinor === currentMajor;
        const isRecent = recentMajors.has(majorMinor);
        return isLts || isCurrent || isRecent;
      });

      // ── 5. Enrich each row with display-ready fields ──────────────────────
      return filtered.map(v => {
        //const majorMinor = v.version.split('.').slice(0, 2).join('.');
        //const isCurrent = !!currentMajor && majorMinor === currentMajor;
        const detected = props.data.detectedVersion?.split('.');
        const isCurrent =
          detected &&
          v.version === `${detected[0]}.${detected[1]}` &&
          v.patches?.includes(props.data.detectedVersion);

        const eomDate = parseQuarterDate(v.eom);
        const ecpDate = parseQuarterDate(v.ecp);

        const eomPassed = eomDate && eomDate < today;
        const ecpPassed = ecpDate && ecpDate < today;

        // Effective status: if EOM date has passed, override status regardless
        const effectiveStatus = eomPassed||ecpPassed ? 'eom' : v.status;

        // Label shown in the Status column
        const effectiveLabel =
          effectiveStatus === 'latest'  ? (v.label || 'Latest') :
          effectiveStatus === 'lts'     ? (v.label || 'LTS') :
          effectiveStatus === 'eom'     ? 'End of Maintenance' :
          (v.label || effectiveStatus);

        // Icon for status
        const statusIcon =
          effectiveStatus === 'latest' ? 'fa-star-of-life' :
          effectiveStatus === 'lts'    ? 'fa-regular fa-star' :
          effectiveStatus === 'eom'    ? 'fa-ban' :
                                         'fa-circle-check';

        // EOM column: show icon if date has passed
        const eomLabel = v.eom
          ? (eomPassed ? `<i class="fa-solid fa-ban"></i> ${v.eom}` : v.eom)
          : '';

        // ECP column: show icon if date has passed
        const ecpLabel = v.ecp
          ? (ecpPassed ? `<i class="fa-solid fa-ban"></i> ${v.ecp}` : v.ecp)
          : '';

        return {
          ...v,
          isCurrent,
          effectiveStatus,
          effectiveLabel,
          statusIcon,
          eomLabel,
          ecpLabel,
        };
      });
    });

    const allIssues = computed(() => [
      ...(props.data?.issues || []),
      ...(props.data?.codeVulnerabilities || []),
      ...(props.data?.redirectVulnerabilities || []),
      ...(props.data?.sensitiveData || []),
      ...(props.data?.owasp || []),
      ...(props.data?.sapSpecific || []),
    ]);

    return { t, sortedVersionRows, allIssues, goUI5 };
  },
};
</script>
<style>
tr.current.version-row-maintained {background: var(--sap-accent); }
</style>