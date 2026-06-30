<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-solid fa-info"></i> {{ t.ui5.about.title }} {{ data?.version }}</div>
    <ul style="font-size:13px;line-height:2;list-style:none">
      <li><strong>{{ t.ui5.about.source }}:</strong> <span class="about-version-text"> {{ data?.source }} </span></li>
      <li><strong>{{ t.ui5.about.name }}:</strong> <span class="about-version-text"> {{ data?.data?.name }} </span></li>
    </ul>
    <div class="sep"></div>
    <div class="card-title" style="margin-top:16px">{{ t.ui5.about.resources }}</div>
    <ul style="font-size:13px;line-height:2;list-style:none">
      <li>
        <a
          :href="`https://ui5.sap.com/${data?.version}/versioninfo.html`"
          target="_blank"
          style="color:var(--sap-blue)"
        >
          <i class="fa-solid fa-location-arrow"></i>
          {{ t.ui5.about.version_info }}
        </a>
      </li>
      <li>
        <a
          :href="`https://ui5.sap.com/${data?.version}/releasenotes.html`"
          target="_blank"
          style="color:var(--sap-blue)"
        >
          <i class="fa-solid fa-location-arrow"></i>
          {{ t.ui5.about.releasenotes }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script>
import { toRef } from 'vue';

import { t } from '../../i18n/index.js';


export default {
  name: 'AboutTab',
  props: { data: { type: Object, default: null } },
  setup(props) {
    const data = toRef(props, 'data');

    return { t, data };
  },
};
</script>
