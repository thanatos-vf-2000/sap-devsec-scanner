<template>
  <div class="card">
    <div class="card-title">{{ t.about.title }}</div>
    <p>
      <strong style="color:var(--sap-dark)">SAP DevSec Scanner</strong>
      {{ t.about.description }}
    </p>
    <div class="card-title" style="margin-top:16px">{{ t.about.scanners }}</div>
    <ul style="font-size:13px;color:var(--sap-gray);line-height:2;list-style:none">
      <li v-for="item in t.about.scannerList" :key="item">{{ item }}</li>
    </ul>
    <div class="card-title" style="margin-top:16px">{{ t.about.resources }}</div>
    <ul style="font-size:13px;line-height:2;list-style:none">
      <li><a href="https://ui5.sap.com/versionoverview.html" target="_blank" style="color:var(--sap-blue)">↗ SAPUI5 Version Overview</a></li>
      <li><a href="https://ui5.sap.com" target="_blank" style="color:var(--sap-blue)">↗ SAPUI5 SDK</a></li>
      <li><a href="https://cap.cloud.sap/docs/guides/security/" target="_blank" style="color:var(--sap-blue)">↗ CAP Security Guide</a></li>
      <li><a href="https://help.sap.com/docs/btp" target="_blank" style="color:var(--sap-blue)">↗ SAP BTP Documentation</a></li>
    </ul>
  </div>
</template>

<script>
import { t } from '../i18n/index.js';
export default {
  name: 'AboutView',
  setup() { return { t }; },
};
</script>
