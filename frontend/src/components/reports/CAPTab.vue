<template>
  <div v-if="!data" class="empty">{{ t.report.cap.noServices }}</div>
  <div v-else>
    <div class="font-bold mb-8"><i class="fa-brands fa-servicestack"></i> {{ t.report.cap.services }}</div>
    <div v-if="!data.services?.length" class="text-gray text-sm">{{ t.report.cap.noServices }}</div>
    <div v-for="(s, i) in data.services" :key="i" class="service-item" :class="s.severity === 'OK' ? 'secure' : 'insecure'">
      <div style="font-size:20px">
        <i v-if="s.severity === 'OK'" class="fa-solid fa-check"></i>
        <i v-else class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <div style="flex:1">
        <div class="font-bold">{{ s.name }}</div>
        <div class="text-sm text-gray">{{ s.file }} : {{ s.line }}</div>
        <div class="text-sm" :style="{ color: s.severity === 'OK' ? '#107e3e' : '#bb0000' }">{{ s.message }}</div>
      </div>
      <span v-if="s.authType" class="sev sev-OK">@requires: {{ s.authType }}</span>
      <span v-if="s.severity !== 'OK'" class="sev sev-HIGH">HIGH</span>
    </div>

    <div class="font-bold mb-8 mt-16"><i class="fa-solid fa-triangle-exclamation"></i> {{ t.report.cap.vulns }}</div>
    <IssuesTable :issues="allVulns" :empty-msg="`${t.report.cap.noVulns}`" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { t } from '../../i18n/index.js';
import IssuesTable from '../IssuesTable.vue';
export default {
  name: 'CAPTab',
  components: { IssuesTable },
  props: { data: { type: Object, default: null } },
  setup(props) {
    const allVulns = computed(() => [
      ...(props.data?.vulnerabilities || []),
      ...(props.data?.mtaIssues || []),
      ...(props.data?.xsuaaIssues || []),
    ]);
    return { t, allVulns };
  },
};
</script>
