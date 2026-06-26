<template>
  <div>
    <div v-if="!report" class="card empty">
      <div class="icon"><i class="fa-solid fa-chart-column"></i></div>
      <p>{{ t.report.noReport }}</p>
    </div>

    <template v-else>
      <!-- Header Card -->
      <div class="card">
        <div class="flex items-center gap-16">
          <!-- Score Ring -->
          <div class="score-ring">
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="50" fill="none" stroke="#eee" stroke-width="10"/>
              <circle cx="60" cy="60" r="50" fill="none"
                :stroke="riskColor(report.riskScore)" stroke-width="10"
                :stroke-dasharray="`${(report.riskScore/100)*314} 314`"
                stroke-linecap="round"/>
            </svg>
            <div class="score-value">
              <div class="num" :style="{ color: riskColor(report.riskScore) }">{{ report.riskScore }}</div>
              <div class="label">{{ t.report.score }}</div>
            </div>
          </div>

          <!-- Meta -->
          <div style="flex:1">
            <h2 style="font-size:20px;margin-bottom:4px">{{ report.projectName }}</h2>
            <div style="margin-bottom:8px">
              <span v-for="type in report.projectTypes" :key="type" class="tag">{{ type }}</span>
            </div>
            <div class="flex gap-8 text-sm text-gray">
              <span><i class="fa-regular fa-calendar-days"></i> {{ t.report.scannedAt(report.scannedAt) }}</span>
              <span><i class="fa-regular fa-file-lines"></i> {{ t.report.filesScanned(report.filesScanned) }}</span>
              <span><i class="fa-solid fa-lock"></i> {{ t.report.risk }}
                <strong :style="{ color: riskColor(report.riskScore) }">
                  <i class="fa-solid" :class="riskIcon(report.riskLevel)"></i> 
                  {{ riskLabel(report.riskLevel) }}
                </strong>
              </span>
            </div>
          </div>

          <!-- Summary grid -->
          <div class="summary-grid" style="grid-template-columns:repeat(5,80px)">
            <div v-for="(sv, i) in severities" :key="sv.key" class="summary-card" :class="sv.cls">
              <div class="num" :style="{ color: sv.color }">{{ report.summary[sv.key] || 0 }}</div>
              <div class="lbl">{{ sv.label }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Tabs Card -->
      <div class="card" style="padding-bottom:0">
        <div class="section-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="section-tab"
            :class="{ active: currentTab === tab.id }"
            @click="currentTab = tab.id"
          >
            <i :class="tabsIcon(tab.id)"></i> {{ tab.label }}
            <span class="count" :class="{ zero: tab.count === 0, crit: tab.crit && tab.count > 0 }">{{ tab.count }}</span>
          </div>
        </div>
        <div style="padding-bottom:20px">
          <UI5Tab v-if="currentTab === 'ui5'" :data="report.results.ui5" />
          <CAPTab v-else-if="currentTab === 'cap'" :data="report.results.cap" />
          <SecretsTab v-else-if="currentTab === 'secrets'" :data="report.results.secrets" />
          <BTPTab v-else-if="currentTab === 'btp'" :data="report.results.btp" />
          <NPMTab v-else-if="currentTab === 'npm'" :data="report.results.npm" />
          <AppRouterTab v-else-if="currentTab === 'approuter'" :data="report.results.approuter" />
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import { t } from '../i18n/index.js';
import UI5Tab from '../components/UI5Tab.vue';
import CAPTab from '../components/CAPTab.vue';
import SecretsTab from '../components/SecretsTab.vue';
import BTPTab from '../components/BTPTab.vue';
import NPMTab from '../components/NPMTab.vue';
import AppRouterTab from '../components/AppRouterTab.vue';

export default {
  name: 'ReportView',
  components: { UI5Tab, CAPTab, SecretsTab, BTPTab, NPMTab, AppRouterTab },
  props: { report: { type: Object, default: null } },
  setup(props) {
    const currentTab = ref('ui5');

    const severities = [
      { key: 'critical', cls: 'crit', color: '#8b0000', label: 'CRITICAL' },
      { key: 'high', cls: 'high', color: '#bb0000', label: 'HIGH' },
      { key: 'medium', cls: 'med', color: '#df6e0c', label: 'MEDIUM' },
      { key: 'low', cls: 'low', color: '#107e3e', label: 'LOW' },
      { key: 'info', cls: 'info', color: '#0a6ed1', label: 'INFO' },
    ];

    const tabs = computed(() => {
      if (!props.report) return [];
      const r = props.report.results;
      return [
        { id: 'ui5', label: t.report.tabs.ui5, icon: '', count: (r.ui5?.issues?.length||0)+(r.ui5?.codeVulnerabilities?.length||0)+(r.ui5?.redirectVulnerabilities?.length||0)+(r.ui5?.sensitiveData?.length||0)+(r.ui5?.owasp?.length||0)+(r.ui5?.sapSpecific?.length||0), crit: false },
        { id: 'cap', label: t.report.tabs.cap, icon: '', count: (r.cap?.services?.length||0)+(r.cap?.vulnerabilities?.length||0)+(r.cap?.mtaIssues?.length||0)+(r.cap?.xsuaaIssues?.length||0), crit: false },
        { id: 'secrets', label: t.report.tabs.secrets, icon: '', count: r.secrets?.findings?.length||0, crit: true },
        { id: 'btp', label: t.report.tabs.btp, icon: '', count: r.btp?.issues?.length||0, crit: true },
        { id: 'npm', label: t.report.tabs.npm, icon: '', count: r.npm?.issues?.length||0, crit: false },
        { id: 'approuter', label: t.report.tabs.approuter, icon: '', count: (r.approuter?.routeIssues?.length||0)+(r.approuter?.versionIssues?.length||0)+(r.approuter?.mtaIssues?.length||0)+(r.approuter?.configIssues?.length||0), crit: false },
      ];
    });

    function riskColor(score) {
      if (score >= 80) return '#107e3e';
      if (score >= 60) return '#df6e0c';
      if (score >= 40) return '#bb0000';
      return '#8b0000';
    }

    function riskIcon(level) {
      const icons = {
        LOW: "fa-regular fa-square-check",
        MEDIUM: "fa-solid fa-triangle-exclamation",
        HIGH: "fa-solid fa-circle-xmark",
        CRITICAL: "fa-solid fa-radiation"
      };

      return icons[level] || "fa-circle-question";
    }

    function riskLabel(level) {
      return t.report.riskLevel[level] || level;
    }

    function tabsIcon(level) {
      const icons = {
        ui5: "fa-solid fa-palette",
        cap: "fa-solid fa-cubes",
        secrets: "fa-solid fa-vault",
        btp: "fa-regular fa-cloud",
        npm: "fa-brands fa-dropbox",
        approuter: "fa-regular fa-map",
      };

      return icons[level] || "fa-circle-question";
    }

    return { t, currentTab, severities, tabs, riskColor, riskIcon, riskLabel, tabsIcon };
  },
};
</script>
