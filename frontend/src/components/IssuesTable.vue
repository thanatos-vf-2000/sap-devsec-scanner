<template>
  <div v-if="!filteredIssues.length">
    <div v-if="emptyMsg" class="alert alert-success">{{ emptyMsg }}</div>
  </div>
  <table v-else class="issue-table">
    <thead>
      <tr>
        <th>{{ t.report.table.severity }}</th>
        <th>{{ t.report.table.code }}</th>
        <th>{{ t.report.table.description }}</th>
        <th>{{ t.report.table.file }}</th>
        <th>{{ t.report.table.excerpt }}</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="(issue, i) in filteredIssues" :key="i">
        <td><span class="sev" :class="`sev-${issue.severity}`">{{ issue.severity }}</span></td>
        <td><code style="font-size:11px;color:#0f2d5b">{{ issue.code || '' }}</code></td>
        <td>{{ issue.message || issue.description || '' }}</td>
        <td class="text-sm text-gray">{{ shortPath(issue.file) }}{{ issue.line ? `:${issue.line}` : '' }}</td>
        <td><span v-if="issue.snippet" class="snippet">{{ issue.snippet }}</span></td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { computed } from 'vue';
import { t } from '../i18n/index.js';

export default {
  name: 'IssuesTable',
  props: {
    issues: { type: Array, default: () => [] },
    emptyMsg: { type: String, default: '' },
  },
  setup(props) {
    const filteredIssues = computed(() => (props.issues || []).filter(i => i.severity !== 'INFO'));

    function shortPath(p) {
      if (!p) return '';
      const parts = p.split('/');
      return parts.length > 3 ? '.../' + parts.slice(-2).join('/') : p;
    }

    return { t, filteredIssues, shortPath };
  },
};
</script>
