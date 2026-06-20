<template>
  <div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
      <!-- Upload ZIP -->
      <div class="card">
        <div class="card-title"><i class="fa-solid fa-cubes"></i>{{ t.scan.zipTitle }}</div>
        <div
          class="upload-zone"
          :class="{ drag: isDragging }"
          @click="$refs.fileInput.click()"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="onDrop"
        >
          <div class="upload-icon"><i class="fa-solid fa-folder-open"></i></div>
          <h3>{{ dropLabel }}</h3>
          <p>{{ dropSubLabel }}</p>
          <p class="text-sm text-gray" style="margin-top:8px">{{ t.scan.dropMax }}</p>
        </div>
        <input ref="fileInput" type="file" accept=".zip" style="display:none" @change="onFileChange">
        <div class="form-group" style="margin-top:12px">
          <label class="form-label">{{ t.scan.projectNameLabel }}</label>
          <input v-model="zipProjectName" type="text" class="form-control" :placeholder="t.scan.projectNamePlaceholder">
        </div>
        <button class="btn btn-primary" style="width:100%" :disabled="scanning" @click="scanZip">
          <i class="fa-solid fa-magnifying-glass"></i> {{ t.scan.scanZipBtn }}
        </button>
      </div>

      <!-- Directory scan -->
      <div class="card">
        <div class="card-title"><i class="fa-solid fa-folder-open"></i>{{ t.scan.dirTitle }}</div>
        <div class="info-box">
          <strong><i class="fa-solid fa-circle-info"></i> {{ t.scan.dirInfoTitle }}</strong>
          {{ t.scan.dirInfoText }}
        </div>
        <div class="form-group">
          <label class="form-label">{{ t.scan.dirPathLabel }}</label>
          <div class="form-row">
            <input v-model="dirPath" type="text" class="form-control" :placeholder="t.scan.dirPathPlaceholder">
            <button class="btn btn-ghost" :disabled="scanning" @click="scanDirectory"><i class="fa-solid fa-magnifying-glass"></i> {{ t.scan.dirScanBtn }}</button>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">{{ t.scan.projectNameLabel }}</label>
          <input v-model="dirProjectName" type="text" class="form-control" :placeholder="t.scan.dirProjectNamePlaceholder">
        </div>
        <div class="info-box" style="margin-top:8px">
          <strong><i class="fa-solid fa-thumbtack"></i> {{ t.scan.filesRecognized }}</strong>
          manifest.json · package.json · ui5.yaml · mta.yaml · xs-security.json · *.cds · *.js · *.ts · .env · default-env.json
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="scanning" class="card loading">
      <div class="spinner"></div>
      <p style="font-size:15px;font-weight:500;color:#333">{{ t.scan.scanningTitle }}</p>
      <p class="text-gray text-sm">{{ scanStatus }}</p>
    </div>

    <!-- Error -->
    <div v-if="errorMsg" class="alert alert-error"><i class="fa-regular fa-circle-xmark"></i> {{ errorMsg }}</div>

    <!-- Quick stats preview -->
    <div v-if="scanDone && !scanning">
      <div class="alert alert-success">
        <i class="fa-solid fa-circle-check"></i> {{ t.scan.scanDone }}
        <a href="#" style="margin-left:8px;color:var(--sap-blue)" @click.prevent="$emit('scan-complete', lastReport)">{{ t.scan.seeReport }} <i class="fa-solid fa-arrow-right-to-bracket"></i></a>
      </div>
    </div>

    <!-- Recent scans -->
    <div class="card" id="recentScans">
      <div class="card-title"><i class="fa-regular fa-clock"></i> {{ t.scan.recentScans }}</div>
      <div v-if="recentItems.length === 0" class="empty">
        <div class="icon"><i class="fa-solid fa-magnifying-glass"></i></div>
        <p>{{ t.scan.noScans }}</p>
      </div>
      <div v-else>
        <div
          v-for="r in recentItems"
          :key="r.scanId"
          class="history-item"
          @click="loadScan(r.scanId)"
        >
          <div class="risk-dot" :style="{ background: riskColor(r.riskScore) }"></div>
          <div style="flex:1">
            <div class="font-bold">{{ r.projectName }}</div>
            <div class="text-sm text-gray"><i class="fa-regular fa-calendar-days"></i> {{ t.report.scannedAt(r.scannedAt) }}</div>
          </div>
          <div style="font-size:18px;font-weight:700;" :style="{ color: riskColor(r.riskScore) }">{{ r.riskScore }}/100</div>
          <div style="color:#999">›</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { t } from '../i18n/index.js';

const API = '';

export default {
  name: 'ScanView',
  emits: ['scan-complete'],
  setup(_, { emit }) {
    const fileInput = ref(null);
    const selectedFile = ref(null);
    const zipProjectName = ref('');
    const dirPath = ref('');
    const dirProjectName = ref('');
    const scanning = ref(false);
    const scanStatus = ref('');
    const errorMsg = ref('');
    const scanDone = ref(false);
    const lastReport = ref(null);
    const isDragging = ref(false);
    const recentItems = ref([]);
    const dropLabel = ref(t.scan.dropHere);
    const dropSubLabel = ref(t.scan.dropOr);

    function riskColor(score) {
      if (score >= 80) return '#107e3e';
      if (score >= 60) return '#df6e0c';
      if (score >= 40) return '#bb0000';
      return '#8b0000';
    }

    function onDrop(e) {
      isDragging.value = false;
      const file = e.dataTransfer.files[0];
      if (file) {
        selectedFile.value = file;
        dropLabel.value = file.name;
        dropSubLabel.value = t.scan.fileSelected;
      }
    }

    function onFileChange() {
      const file = fileInput.value?.files[0];
      if (file) {
        selectedFile.value = file;
        dropLabel.value = file.name;
        dropSubLabel.value = t.scan.fileSelected;
      }
    }

    async function scanZip() {
      if (!selectedFile.value) { errorMsg.value = t.scan.errorNoFile; return; }
      const name = zipProjectName.value || selectedFile.value.name.replace('.zip', '');
      const fd = new FormData();
      fd.append('project', selectedFile.value);
      fd.append('projectName', name);
      scanning.value = true;
      scanStatus.value = t.scan.extracting;
      errorMsg.value = '';
      scanDone.value = false;
      try {
        const resp = await fetch(API + '/api/scan/upload', { method: 'POST', body: fd });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || t.scan.errorServer);
        handleResult(data);
      } catch (e) {
        errorMsg.value = e.message;
      } finally {
        scanning.value = false;
      }
    }

    async function scanDirectory() {
      if (!dirPath.value.trim()) { errorMsg.value = t.scan.errorNoPath; return; }
      const name = dirProjectName.value || dirPath.value.split('/').pop();
      scanning.value = true;
      scanStatus.value = t.scan.reading;
      errorMsg.value = '';
      scanDone.value = false;
      try {
        const resp = await fetch(API + '/api/scan/directory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dirPath: dirPath.value.trim(), projectName: name }),
        });
        const data = await resp.json();
        if (!resp.ok) throw new Error(data.error || t.scan.errorServer);
        handleResult(data);
      } catch (e) {
        errorMsg.value = e.message;
      } finally {
        scanning.value = false;
      }
    }

    function handleResult(data) {
      lastReport.value = data.report;
      scanDone.value = true;
      loadHistory();
      emit('scan-complete', data.report);
    }

    async function loadHistory() {
      try {
        const resp = await fetch(API + '/api/scan/history');
        const data = await resp.json();
        recentItems.value = data.slice(0, 3);
      } catch {}
    }

    async function loadScan(scanId) {
      try {
        const resp = await fetch(API + '/api/scan/' + scanId);
        const data = await resp.json();
        emit('scan-complete', data);
      } catch {}
    }

    onMounted(loadHistory);

    return {
      t, fileInput, zipProjectName, dirPath, dirProjectName, scanning, scanStatus,
      errorMsg, scanDone, lastReport, isDragging, recentItems, dropLabel, dropSubLabel,
      riskColor, onDrop, onFileChange, scanZip, scanDirectory, loadScan,
    };
  },
};
</script>
