<script>
import { t } from '../i18n/index.js';
export default {
  name: 'AboutView',
  setup() { return { t,
      appVersion: __APP_VERSION__,
      uiVersion: __UI_VERSION__,
      buildDate: Date(__BUILD_TIME__).toLocaleString(),
      gitHash: __GIT_HASH__,
      hAuthors: __HUMANS_AUTHORS__,
      hmaintainers: __HUMANS_MAINT__, }; },
};
</script>

<template>
  <div class="card">
    <div class="card-title">{{ t.about.title }}</div>
    <p>
      <strong style="color:var(--sap-dark)">SAP DevSec Scanner</strong>
      {{ t.about.description }}
    </p>
    <div class="sep"></div>
    <div class="card-title" style="margin-top:16px">{{ t.about.version }}</div>
    <ul style="font-size:13px;line-height:2;list-style:none">
      <li><strong>{{ t.about.versionList.build }}:</strong> <span class="about-version-text"> {{ buildDate }} </span></li>
      <li><strong>{{ t.about.versionList.git }}:</strong> <span class="about-version-text"> {{ gitHash }} </span></li>
      <li><strong>{{ t.about.versionList.app }}:</strong> <span class="about-version-text"> {{ appVersion }} </span></li>
      <li><strong>{{ t.about.versionList.ui }}:</strong> <span class="about-version-text"> {{ uiVersion }} </span></li>
    </ul>
    <div class="sep"></div>
    <div class="card-title" style="margin-top:16px">{{ t.about.scanners }}</div>
    <ul style="font-size:13px;color:var(--sap-gray);line-height:2;list-style:none">
      <li v-for="item in t.about.scannerList" :key="item"><i class="fa-regular fa-square-caret-right"></i> {{ item }}</li>
    </ul>
    <div class="sep"></div>
    <div class="card-title" style="margin-top:16px">{{ t.about.resources }}</div>
    <ul style="font-size:13px;line-height:2;list-style:none">
      <li><a href="https://ui5.sap.com/versionoverview.html" target="_blank" style="color:var(--sap-blue)"><i class="fa-solid fa-location-arrow"></i> SAPUI5 Version Overview</a></li>
      <li><a href="https://ui5.sap.com" target="_blank" style="color:var(--sap-blue)"><i class="fa-solid fa-location-arrow"></i> SAPUI5 SDK</a></li>
      <li><a href="https://cap.cloud.sap/docs/guides/security/" target="_blank" style="color:var(--sap-blue)"><i class="fa-solid fa-location-arrow"></i> CAP Security Guide</a></li>
      <li><a href="https://help.sap.com/docs/btp" target="_blank" style="color:var(--sap-blue)"><i class="fa-solid fa-location-arrow"></i> SAP BTP Documentation</a></li>
    </ul>
    <div class="sep"></div>
    <div class="card-title" style="margin-top:16px">{{ t.about.authors }}</div>
    <ul style="font-size:13px;line-height:2;list-style:none">
      <li v-for="item in hAuthors" :key="item.email">
        <a 
          :href="`mailto:${item.email}`"
          class="humans-link"
        >
          <i class="fa-solid fa-person-walking-arrow-right"></i> {{ item.name }}
        </a>
      </li>
    </ul>
    <div class="sep"></div>
    <div class="card-title" style="margin-top:16px">{{ t.about.maintainers }}</div>
    <ul style="font-size:13px;line-height:2;list-style:none">
      <li v-for="item in hmaintainers" :key="item.email">
        <a 
          :href="`mailto:${item.email}`"
          class="humans-link"
        >
          <i class="fa-solid fa-person-walking-arrow-right"></i> {{ item.name }}
        </a>
      </li>
    </ul>
  </div>
</template>
