<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-solid fa-vault"></i> {{ t.report.secrets.title }}</div>
    <IssuesTable :issues="findings" :empty-msg="`<i class='fa-regular fa-circle-check'></i> ${t.report.secrets.noSecrets}`" />
  </div>
</template>

<script>
import { computed } from 'vue';
import { t } from '../i18n/index.js';
import IssuesTable from './IssuesTable.vue';
export default {
  name: 'SecretsTab',
  components: { IssuesTable },
  props: { data: { type: Object, default: null } },
  setup(props) {
    const findings = computed(() => props.data?.findings || []);
    return { t, findings };
  },
};
</script>
