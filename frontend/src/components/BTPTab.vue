<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-regular fa-cloud"></i> {{ t.report.btp.title }}</div>
    <IssuesTable :issues="issues" :empty-msg="`${t.report.btp.noIssues}`"  />
  </div>
</template>

<script>
import { computed } from 'vue';
import { t } from '../i18n/index.js';
import IssuesTable from './IssuesTable.vue';
export default {
  name: 'BTPTab',
  components: { IssuesTable },
  props: { data: { type: Object, default: null } },
  setup(props) {
    const issues = computed(() => props.data?.issues || []);
    return { t, issues };
  },
};
</script>
