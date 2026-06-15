<template>
  <div v-if="!data" class="empty">{{ t.report.npm.noData }}</div>
  <div v-else>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
      <div>
        <div class="font-bold mb-8">{{ t.report.npm.stats }}</div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">
          <div class="summary-card" style="border-left:3px solid #0a6ed1">
            <div class="num">{{ data.summary?.total || 0 }}</div>
            <div class="lbl">{{ t.report.npm.total }}</div>
          </div>
          <div class="summary-card" style="border-left:3px solid #0f2d5b">
            <div class="num">{{ data.summary?.sap || 0 }}</div>
            <div class="lbl">{{ t.report.npm.sapPkgs }}</div>
          </div>
        </div>
      </div>
      <div>
        <div class="font-bold mb-8">{{ t.report.npm.recommended }}</div>
        <div style="background:#1e2a3a;color:#e2e8f0;padding:12px;border-radius:4px;font-family:monospace;font-size:12px;line-height:1.8">
          <div>{{ t.report.npm.audit }}</div>
          <div style="color:#68d391">npm audit</div>
          <div style="margin-top:4px">{{ t.report.npm.fix }}</div>
          <div style="color:#68d391">npm audit fix</div>
          <div style="margin-top:4px">{{ t.report.npm.checkUpdates }}</div>
          <div style="color:#68d391">npx npm-check-updates</div>
        </div>
      </div>
    </div>

    <div class="font-bold mb-8">{{ t.report.npm.sapPkgsList }}</div>
    <table class="issue-table" style="margin-bottom:16px">
      <thead>
        <tr><th>{{ t.report.npm.package }}</th><th>{{ t.report.npm.version }}</th><th>{{ t.report.npm.file }}</th></tr>
      </thead>
      <tbody>
        <tr v-for="(p, i) in data.sapPackages" :key="i">
          <td>{{ p.name }}</td>
          <td><code style="font-size:12px">{{ p.version }}</code></td>
          <td class="text-sm text-gray">{{ p.file }}</td>
        </tr>
        <tr v-if="!data.sapPackages?.length">
          <td colspan="3" class="text-gray">{{ t.report.npm.noSapPkgs }}</td>
        </tr>
      </tbody>
    </table>

    <div class="font-bold mb-8">{{ t.report.npm.npmIssues }}</div>
    <IssuesTable :issues="data.issues || []" :empty-msg="t.report.npm.noIssues" />
  </div>
</template>

<script>
import { t } from '../i18n/index.js';
import IssuesTable from './IssuesTable.vue';
export default {
  name: 'NPMTab',
  components: { IssuesTable },
  props: { data: { type: Object, default: null } },
  setup() { return { t }; },
};
</script>
