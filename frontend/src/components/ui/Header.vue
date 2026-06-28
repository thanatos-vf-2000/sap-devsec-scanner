<template>
<header class="shell-header">
        <div class="shell-logo">
          <div class="shield"><img src="/logo.png" alt="Logo" /></div>
          SAP DevSec Scanner
        </div>

        <div class="shell-healt-status">
          <span class="shell-healt-dot" :style="{ background: healthColor }"></span>
          <span class="shell-healt-info">{{ healthMsg }}</span>
        </div>
        <div class="shell-right">v<span>{{ appVersion }}</span></div>
    </header>
</template>
<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { t } from '../../i18n/index.js';


const appVersion = ref('...');

const healthColor = ref('#107e3e');
const healthMsg = ref(t.health.connected);

const API = '';
let healthInterval = null;


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
    appVersion.value = '---';
  }
}

onMounted(() => {
  checkBackend();
  healthInterval = setInterval(checkBackend, 10000);
});

onUnmounted(() => {
  clearInterval(healthInterval);
});
</script>