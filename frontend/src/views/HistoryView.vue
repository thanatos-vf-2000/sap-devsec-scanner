<template>
  <div class="card">
    <div class="flex items-center gap-8" style="margin-bottom:16px">
      <div class="card-title" style="margin-bottom:0">{{ t.history.title }}</div>
      <button class="btn btn-ghost btn-sm ml-auto" @click="clearHistory">{{ t.history.clearAll }}</button>
    </div>
    <div v-if="items.length === 0" class="empty">
      <div class="icon">📋</div>
      <p>{{ t.history.noHistory }}</p>
    </div>
    <div v-else>
      <div
        v-for="r in items"
        :key="r.scanId"
        class="history-item"
        @click="loadScan(r.scanId)"
      >
        <div class="risk-dot" :style="{ background: riskColor(r.riskScore) }"></div>
        <div style="flex:1">
          <div class="font-bold">{{ r.projectName }}</div>
          <div class="text-sm text-gray">{{ t.report.scannedAt(r.scannedAt) }}</div>
          <div style="margin-top:4px">
            <span v-for="type in r.projectTypes" :key="type" class="tag">{{ type }}</span>
          </div>
        </div>
        <div style="text-align:right">
          <div style="font-size:22px;font-weight:700;" :style="{ color: riskColor(r.riskScore) }">{{ r.riskScore }}</div>
          <div class="text-sm text-gray">{{ t.history.securityScore }}</div>
          <div class="text-sm" :style="{ color: riskColor(r.riskScore) }">{{ riskLabel(r.riskLevel) }}</div>
        </div>
        <div style="color:#999;font-size:18px">›</div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { t } from '../i18n/index.js';

const API = '';

export default {
  name: 'HistoryView',
  emits: ['load-scan'],
  setup(_, { emit }) {
    const items = ref([]);

    async function loadHistory() {
      try {
        const resp = await fetch(API + '/api/scan/history');
        items.value = await resp.json();
      } catch {}
    }

    async function loadScan(scanId) {
      try {
        const resp = await fetch(API + '/api/scan/' + scanId);
        const data = await resp.json();
        emit('load-scan', data);
      } catch {}
    }

    async function clearHistory() {
      if (!confirm(t.history.confirmClear)) return;
      try {
        for (const item of items.value) {
          await fetch(API + '/api/scan/' + item.scanId, { method: 'DELETE' });
        }
        items.value = [];
      } catch {}
    }

    function riskColor(score) {
      if (score >= 80) return '#107e3e';
      if (score >= 60) return '#df6e0c';
      if (score >= 40) return '#bb0000';
      return '#8b0000';
    }

    function riskLabel(level) {
      return t.report.riskLevel[level] || level;
    }

    onMounted(loadHistory);

    return { t, items, loadScan, clearHistory, riskColor, riskLabel };
  },
};
</script>
