<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-regular fa-map"></i> {{ t.report.approuter.title }}</div>
    <IssuesTable :issues="allIssues" :empty-msg="`${t.report.approuter.noIssues}`"  />
  </div>
</template>

<script>
import { computed } from 'vue';
import { t } from '../i18n/index.js';
import IssuesTable from './IssuesTable.vue';
export default {
  name: 'AppRouterTab',
  components: { IssuesTable },
  props: { data: { type: Object, default: null } },
  setup(props) {
    const allIssues = computed(() => [
      ...(props.data?.routeIssues || []),
      ...(props.data?.versionIssues || []),
      ...(props.data?.mtaIssues || []),
      ...(props.data?.configIssues || []),
    ]);
    return { t, allIssues };
  },
};
</script>
