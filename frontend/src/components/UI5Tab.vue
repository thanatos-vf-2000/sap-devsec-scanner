<template>
  <div v-if="!data" class="empty">Aucune donnée UI5</div>
  <div v-else>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <!-- Left: detected version + sources -->
      <div>
        <div class="font-bold mb-8">{{ t.report.ui5.detectedVersion }}</div>
        <div style="padding:16px;background:#f7f7f7;border:1px solid #ddd;border-radius:4px">
          <div v-if="data.detectedVersion" style="font-size:24px;font-weight:700;color:#0f2d5b">{{ data.detectedVersion }}</div>
          <div v-else style="color:#999">{{ t.report.ui5.notDetected }}</div>
          <div style="margin-top:8px;font-size:12px">
            <div>{{ t.report.ui5.lts }} <strong>{{ data.ltsVersion }}</strong></div>
            <div>{{ t.report.ui5.latest }} <strong>{{ data.latestVersion }}</strong></div>
          </div>
        </div>

        <div class="font-bold mb-8 mt-16">{{ t.report.ui5.sources }}</div>
        <ul style="list-style:none">
          <li v-for="(s, i) in data.sources" :key="i" style="padding:4px 0;border-bottom:1px solid #eee;font-size:12px">
            <span style="font-weight:500">{{ s.file }}</span> - {{ s.key }}: <code style="background:#f0f0f0;padding:1px 4px">{{ s.value }}</code>
          </li>
          <li v-if="!data.sources?.length" class="text-gray">{{ t.report.ui5.noSources }}</li>
        </ul>
        <div style="margin-top:12px">
          <a href="https://ui5.sap.com/versionoverview.html" target="_blank" class="btn btn-ghost btn-sm">{{ t.report.ui5.officialVersions }}</a>
        </div>
      </div>

      <!-- Right: version table -->
      <div>
        <div class="font-bold mb-8">{{ t.report.ui5.versionTable(data.versionDate) }}</div>
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
              :class="[v.isCurrent ? 'current' : '', `version-row-${v.status}`]"
            >
              <td>
                <strong v-if="v.isCurrent">{{ v.version }}</strong>
                <span v-else>{{ v.version }}</span>
                <span v-if="v.isCurrent"> {{ t.report.ui5.yourVersion }}</span>
              </td>
              <td>{{ v.statusIcon }} {{ v.label }}</td>
              <td>{{ v.eomLabel }}</td>
              <td>{{ v.ecpLabel }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="font-bold mb-8">{{ t.report.ui5.issues }}</div>
    <IssuesTable :issues="allIssues" :empty-msg="t.report.ui5.noIssues" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { t } from '../i18n/index.js';
import IssuesTable from './IssuesTable.vue';

function quarterToMonth(q) {
  return { Q1: '03', Q2: '06', Q3: '09', Q4: '12' }[q];
}
function parseQuarterDate(value) {
  if (!value) return null;
  const match = value.match(/(Q[1-4])\/(\d{4})/);
  if (!match) return null;
  return new Date(`${match[2]}-${quarterToMonth(match[1])}-01`);
}

export default {
  name: 'UI5Tab',
  components: { IssuesTable },
  props: { data: { type: Object, default: null } },
  setup(props) {
    const today = new Date();

    const sortedVersionRows = computed(() => {
      if (!props.data?.versionTable) return [];
      const versions = [...props.data.versionTable].sort((a, b) => {
        if (a.version !== b.version) return b.version.localeCompare(a.version, undefined, { numeric: true });
        return b.patch?.localeCompare(a.patch, undefined, { numeric: true }) ?? 0;
      });

      // Group by major.minor
      const grouped = [];
      for (const v of versions) {
        const major = v.version.split('.').slice(0, 2).join('.');
        const last = grouped[grouped.length - 1];
        if (!last || last.version !== major) grouped.push({ ...v, patches: [v.patch] });
        else last.patches.push(v.patch);
      }

      const currentMajor = props.data.detectedVersion
        ? props.data.detectedVersion.split('.').slice(0, 2).join('.')
        : null;

      return grouped.map(v => {
        const versionMajor = v.version.split('.').slice(0, 2).join('.');
        const isCurrent = currentMajor && currentMajor === versionMajor;
        const statusIcon = v.status === 'latest' ? '🆕' : v.status === 'lts' ? '⭐' : v.status === 'eom' ? '❌' : '✅';

        const eomDate = parseQuarterDate(v.eom);
        const ecpDate = parseQuarterDate(v.ecp);
        const eomLabel = eomDate ? (eomDate < today ? `❌ ${v.eom}` : v.eom) : '';
        const ecpLabel = ecpDate ? (ecpDate < today ? `❌ ${v.ecp}` : v.ecp) : '';

        return { ...v, isCurrent, statusIcon, eomLabel, ecpLabel };
      });
    });

    const allIssues = computed(() => [
      ...(props.data?.issues || []),
      ...(props.data?.codeVulnerabilities || []),
    ]);

    return { t, sortedVersionRows, allIssues };
  },
};
</script>
