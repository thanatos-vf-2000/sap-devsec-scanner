<template>
  <div id="app">
    <!-- Shell Header -->
    <header class="shell-header">
      <div class="shell-logo">
        <div class="shield"><img src="/logo.png" alt="Logo" /></div>
        SAP DevSec Scanner
      </div>
      <nav class="shell-nav">
        <a
          v-for="item in navItems"
          :key="item.view"
          :class="{ active: currentView === item.view }"
          @click="showView(item.view)"
        ><i :class="['fas', item.icon]"></i> {{ item.label }}</a>
      </nav>
      <div class="shell-healt-status">
        <span class="shell-healt-dot" :style="{ background: healthColor }"></span>
        <span class="shell-healt-info">{{ healthMsg }}</span>
      </div>
      <div class="shell-right">v<span>{{ appVersion }}</span></div>
    </header>

    <main class="main">
      <!-- SCAN VIEW -->
      <ScanView v-show="currentView === 'scan'" @scan-complete="onScanComplete" :parameters="parameters" />

      <!-- REPORT VIEW -->
      <ReportView v-show="currentView === 'report'" :report="currentReport" />

      <!-- HISTORY VIEW -->
      <HistoryView v-if="currentView === 'history'" @load-scan="onLoadScan" />

      <!-- ABOUT VIEW -->
      <AboutView v-show="currentView === 'about'" />
    </main>

    <footer class="footer">
      <div>App v{{ APP_VERSION }} · UI v{{ UI_VERSION }} (node: {{ NODE_ENV }} - build: {{ BUILD_NUMBER }})</div>
      <div>Build: {{ buildTime }}</div>
      <div>Commit: {{ GIT_HASH }}</div>
    </footer>
  </div>
</template>

<script setup>
const APP_VERSION = __APP_VERSION__;
const UI_VERSION = __UI_VERSION__;
const GIT_HASH = __GIT_HASH__;

const buildTime = new Date(__BUILD_TIME__).toLocaleString();

const NODE_ENV = __NODE_ENV__;
const BUILD_NUMBER = __BUILD_NUMBER__;

import { ref, onMounted, onUnmounted } from 'vue';
import { t } from './i18n/index.js';

import ScanView from './views/ScanView.vue';
import ReportView from './views/ReportView.vue';
import HistoryView from './views/HistoryView.vue';
import AboutView from './views/AboutView.vue';

const API = '';

const currentView = ref('scan');
const currentReport = ref(null);
const appVersion = ref('...');
const healthColor = ref('#107e3e');
const healthMsg = ref(t.health.connected);
const parameters      = ref({});

let healthInterval = null;

const navItems = [
  { view: 'scan', label: t.nav.scanner, icon: 'fa-magnifying-glass' },
  { view: 'report', label: t.nav.report, icon: 'fa-chart-column' },
  { view: 'history', label: t.nav.history, icon: 'fa-file-lines' },
  { view: 'about', label: t.nav.about, icon: 'fa-circle-info' },
];

function showView(name) {
  currentView.value = name;
}

function onScanComplete(report) {
  currentReport.value = report;
  showView('report');
}

function onLoadScan(report) {
  currentReport.value = report;
  showView('report');
}

async function init() {
  try {
    const res = await fetch(`${API}/api/sap/ui5/version`);
    if (res.ok) {
      const data = await res.json();
      parameters.value['sap.com']       = true;
      parameters.value['sap.com.data']  = data;
    }
  } catch {
    parameters.value['sap.com'] = false;
  }
}

async function checkBackend() {
  try {
    const res = await fetch(`${API}/api/health`);
    if (res.ok) {
      const data = await res.json();
      healthColor.value = '#107e3e';
      healthMsg.value = t.health.status(data.service, data.version);
      appVersion.value = data.version;
    }
  } catch {
    healthColor.value = '#8b0000';
    healthMsg.value = t.health.disconnected;
  }
}

onMounted(() => {
  init();
  checkBackend();
  healthInterval = setInterval(checkBackend, 10000);
});

onUnmounted(() => {
  clearInterval(healthInterval);
});

</script>

<style>
:root {
  --sap-blue: #0a6ed1;
  --sap-dark: #0f2d5b;
  --sap-accent: #e8f4fd;
  --sap-green: #107e3e;
  --sap-orange: #e76500;
  --sap-red: #bb0000;
  --sap-yellow: #df6e0c;
  --sap-gray: #6a6d70;
  --sap-light: #f7f7f7;
  --sap-border: #d9d9d9;
  --sap-white: #ffffff;
  --sap-critical: #8b0000;
  --font: -apple-system, BlinkMacSystemFont, '72', 'SAP-icons', 'Arial', sans-serif;
  --radius: 4px;
  --shadow: 0 2px 8px rgba(0,0,0,.12);
}
* { box-sizing: border-box; margin: 0; padding: 0; }
body { font-family: var(--font); background: var(--sap-light); color: #333; font-size: 14px; line-height: 1.5; }

.shell-header { background: var(--sap-dark); color: white; display: flex; align-items: center; gap: 16px; padding: 0 24px; height: 44px; box-shadow: 0 2px 4px rgba(0,0,0,.3); position: sticky; top: 0; z-index: 100; }
.shell-logo { font-size: 18px; font-weight: 700; letter-spacing: -0.5px; color: white; display: flex; align-items: center; gap: 8px; }
.shell-logo .shield { width: 24px; height: 24px; background: var(--sap-blue); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; display: flex; align-items: center; justify-content: center; font-size: 13px; }
.shell-logo .shield img { width: 24px; height: 24px; object-fit: contain; background: var(--sap-accent); border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%; display: flex; align-items: center; justify-content: center;}
.shell-nav { display: flex; gap: 0; margin-left: 24px; height: 100%; }
.shell-nav a { color: rgba(255,255,255,.75); text-decoration: none; padding: 0 16px; height: 100%; display: flex; align-items: center; font-size: 13px; border-bottom: 2px solid transparent; transition: all .15s; cursor: pointer; }
.shell-nav a:hover, .shell-nav a.active { color: white; border-bottom-color: #5ab4f5; background: rgba(255,255,255,.08); }
.shell-nav i.fas { margin-right: 10px;}
.shell-right { margin-left: auto; font-size: 12px; color: rgba(255,255,255,.5); }
.shell-healt-status { display: flex; align-items: center; gap: 6px; font-size: 12px; color: var(--sap-white); position: relative; }
.shell-healt-status:hover .shell-healt-info { visibility: visible; opacity: 1; }
.shell-healt-info { visibility: hidden; min-width: 200px; background-color: var(--sap-blue); color: white; text-align: center; border-radius: 5px; padding: 8px; position: absolute; z-index: 1; bottom: -44px; left: 50%; transform: translateX(-50%); opacity: 0; transition: opacity 0.3s; white-space: nowrap; }
.shell-healt-dot { width: 7px; height: 7px; border-radius: 50%; box-shadow: 0 0 6px currentColor; animation: pulse 2s infinite; }
@keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }

.main { max-width: 1200px; margin: 0 auto; padding: 24px; }

/* Cards */
.card { background: white; border: 1px solid var(--sap-border); border-radius: var(--radius); padding: 20px 24px; margin-bottom: 16px; }
.card-title { font-size: 15px; font-weight: 600; color: var(--sap-dark); margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

/* Buttons */
.btn { display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius); font-size: 14px; font-weight: 500; cursor: pointer; border: 1px solid transparent; transition: all .15s; text-decoration: none; }
.btn-primary { background: var(--sap-blue); color: white; border-color: var(--sap-blue); }
.btn-primary:hover { background: #0854a0; border-color: #0854a0; }
.btn-ghost { background: white; color: var(--sap-blue); border-color: var(--sap-blue); }
.btn-ghost:hover { background: var(--sap-accent); }
.btn-danger { background: var(--sap-red); color: white; border-color: var(--sap-red); }
.btn-sm { padding: 4px 10px; font-size: 12px; }

/* Severity badges */
.sev { display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 10px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; }
.sev-CRITICAL { background: #fde; color: #8b0000; border: 1px solid #f5a0a0; }
.sev-HIGH { background: #ffe8e8; color: #bb0000; border: 1px solid #ffb0b0; }
.sev-MEDIUM { background: #fff3e0; color: #a05a00; border: 1px solid #ffd080; }
.sev-LOW { background: #e8f5e9; color: #1b5e20; border: 1px solid #a0cfa0; }
.sev-INFO { background: #e3f2fd; color: #0d47a1; border: 1px solid #90caf9; }
.sev-OK { background: #e8f5e9; color: #107e3e; border: 1px solid #81c784; }

/* Summary grid */
.summary-grid { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
.summary-card { background: var(--sap-light); border: 1px solid var(--sap-border); border-radius: var(--radius); padding: 12px 16px; text-align: center; }
.summary-card .num { font-size: 24px; font-weight: 700; }
.summary-card .lbl { font-size: 11px; color: var(--sap-gray); text-transform: uppercase; letter-spacing: .5px; margin-top: 2px; }
.summary-card.crit { border-left: 3px solid #8b0000; }
.summary-card.high { border-left: 3px solid var(--sap-red); }
.summary-card.med { border-left: 3px solid var(--sap-orange); }
.summary-card.low { border-left: 3px solid var(--sap-green); }
.summary-card.info { border-left: 3px solid var(--sap-blue); }

/* Score ring */
.score-ring { width: 120px; height: 120px; position: relative; }
.score-ring svg { transform: rotate(-90deg); }
.score-value { position: absolute; top: 50%; left: 50%; transform: translate(-50%,-50%); text-align: center; }
.score-value .num { font-size: 28px; font-weight: 700; }
.score-value .label { font-size: 10px; color: var(--sap-gray); text-transform: uppercase; letter-spacing: .5px; }

/* Issues table */
.issue-table { width: 100%; border-collapse: collapse; }
.issue-table th { text-align: left; padding: 8px 12px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .5px; color: var(--sap-gray); border-bottom: 1px solid var(--sap-border); background: var(--sap-light); }
.issue-table td { padding: 10px 12px; border-bottom: 1px solid #eee; font-size: 13px; vertical-align: top; }
.issue-table tr:hover td { background: #fafafa; }
.issue-table tr:last-child td { border-bottom: none; }

/* Code snippet */
.snippet { font-family: 'Courier New', monospace; font-size: 11px; background: #1e2a3a; color: #e2e8f0; padding: 4px 8px; border-radius: 3px; display: inline-block; max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }

/* Section tabs */
.section-tabs { display: flex; gap: 0; border-bottom: 1px solid var(--sap-border); margin-bottom: 20px; overflow-x: auto; }
.section-tab { padding: 10px 20px; cursor: pointer; font-size: 13px; font-weight: 500; color: var(--sap-gray); border-bottom: 2px solid transparent; transition: all .15s; white-space: nowrap; display: flex; align-items: center; gap: 6px; }
.section-tab:hover { color: var(--sap-blue); }
.section-tab.active { color: var(--sap-blue); border-bottom-color: var(--sap-blue); }
.section-tab .count { background: var(--sap-blue); color: white; font-size: 10px; padding: 1px 6px; border-radius: 10px; }
.section-tab .count.zero { background: #ccc; }
.section-tab .count.crit { background: var(--sap-critical); }

/* Version table */
.version-table { width: 100%; border-collapse: collapse; font-size: 13px; }
.version-table th { text-align: left; padding: 6px 12px; background: var(--sap-light); border: 1px solid var(--sap-border); font-weight: 600; }
.version-table td { padding: 8px 12px; border: 1px solid var(--sap-border); }
.version-row-lts td { color: var(--sap-green); font-weight: 500; }
.version-row-latest td { color: var(--sap-blue); font-weight: 500; }

/* Services */
.service-item { border: 1px solid var(--sap-border); border-radius: var(--radius); padding: 12px 16px; margin-bottom: 8px; display: flex; align-items: center; gap: 12px; }
.service-item.secure { border-left: 3px solid var(--sap-green); }
.service-item.insecure { border-left: 3px solid var(--sap-red); }

/* History */
.history-item { border: 1px solid var(--sap-border); border-radius: var(--radius); padding: 16px 20px; margin-bottom: 8px; display: flex; align-items: center; gap: 16px; cursor: pointer; transition: all .15s; background: white; }
.history-item:hover { border-color: var(--sap-blue); box-shadow: var(--shadow); }
.risk-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }

/* Loading */
.loading { text-align: center; padding: 60px; }
.spinner { width: 40px; height: 40px; border: 3px solid #e3f2fd; border-top-color: var(--sap-blue); border-radius: 50%; animation: spin .8s linear infinite; margin: 0 auto 16px; }
@keyframes spin { to { transform: rotate(360deg); } }

/* Empty state */
.empty { text-align: center; padding: 48px; color: var(--sap-gray); }
.empty .icon { font-size: 48px; margin-bottom: 12px; }

/* Alert */
.alert { padding: 12px 16px; border-radius: var(--radius); margin-bottom: 16px; display: flex; align-items: center; gap: 10px; font-size: 13px; }
.alert-error { background: #ffe8e8; border: 1px solid #ffb0b0; color: #bb0000; }
.alert-success { background: #e8f5e9; border: 1px solid #a5d6a7; color: var(--sap-green); }
.alert-info { background: var(--sap-accent); border: 1px solid #b0d0f0; color: var(--sap-dark); }

/* Form */
.form-group { margin-bottom: 16px; }
.form-label { display: block; font-size: 13px; font-weight: 500; margin-bottom: 4px; color: #333; }
.form-control { width: 100%; padding: 8px 12px; border: 1px solid var(--sap-border); border-radius: var(--radius); font-size: 14px; transition: border-color .15s; }
.form-control:focus { outline: none; border-color: var(--sap-blue); box-shadow: 0 0 0 2px rgba(10,110,209,.15); }
.form-row { display: grid; grid-template-columns: 1fr auto; gap: 8px; align-items: end; }

/* Info box */
.info-box { background: var(--sap-accent); border: 1px solid #b0d0f0; border-radius: var(--radius); padding: 12px 16px; margin-bottom: 16px; font-size: 13px; color: var(--sap-dark); }
.info-box strong { display: block; margin-bottom: 4px; color: var(--sap-blue); }

/* Tags */
.tag { display: inline-block; padding: 2px 8px; background: #e0edff; color: var(--sap-blue); border-radius: 10px; font-size: 11px; font-weight: 500; margin: 2px; }

/* Upload zone */
.upload-zone { border: 2px dashed #b0c9e8; border-radius: var(--radius); padding: 24px 32px; text-align: center; cursor: pointer; transition: all .2s; background: var(--sap-accent); }
.upload-zone:hover, .upload-zone.drag { border-color: var(--sap-blue); background: #d6eaf8; }
.upload-zone h3 { font-size: 16px; color: var(--sap-dark); margin: 12px 0 8px; }
.upload-zone p { color: var(--sap-gray); font-size: 13px; }
.upload-icon { font-size: 48px; }

/* Flex helpers */
.flex { display: flex; }
.items-center { align-items: center; }
.gap-8 { gap: 8px; }
.gap-16 { gap: 16px; }
.ml-auto { margin-left: auto; }
.mt-16 { margin-top: 16px; }
.mb-8 { margin-bottom: 8px; }
.text-gray { color: var(--sap-gray); }
.text-sm { font-size: 12px; }
.font-bold { font-weight: 600; }

.about-version-text {color: var(--sap-blue); font-weight: bold;}
.sep { width: 90%; height: 2px; background-color: var(--sap-gray); margin: 10px 5% 10px 5%; }

.humans-link { color: inherit; text-decoration: none; font: inherit; }
.humans-link:visited { color: inherit; }
.humans-link:hover { color: inherit; text-decoration: none; }
.humans-link:active { color: inherit; }

/* Footer */
.footer { position: fixed; bottom: 0; left: 0; right: 0; font-size: 12px; padding: 6px 12px; display: flex; justify-content: space-between; background: var(--sap-gray); color: var(--sap-light); border-top: 1px solid color-mix(in srgb, var(--sap-gray), black 20%); }
@media (max-width: 768px) {
  .summary-grid { grid-template-columns: repeat(3, 1fr); }
  .main { padding: 16px; }
}
</style>
