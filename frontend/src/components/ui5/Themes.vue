<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-solid fa-desktop"></i> {{ t.ui5.themes.title }}</div>
    <div v-if="!data" class="empty">{{ t.ui5.themes.empty }}</div>
    <div v-else style="display:grid;grid-template-columns:1fr 4fr;gap:16px;margin-bottom:16px" >
      <!-- Left: supportedThemes -->
      <div>
        <div class="font-bold mb-8"><i class="fa-regular fa-file-lines"></i> {{ t.ui5.themes.supportedThemes }}</div>
        <table class="version-table">
          <thead>
            <tr><th>{{ t.ui5.name }}</th></tr>
          </thead>
          <tbody>
            <tr
              v-for="(a) in data?.data?.supportedThemes"
              :key="a"
            >
              <td>{{ a }}</td>
          </tr>
          </tbody>
        </table>
      </div>
      <!-- Right: Themes informations -->
      <div>
        <div class="font-bold mb-8"><i class="fa-regular fa-file-lines"></i> {{ t.ui5.themes.infoThemes }}</div>
        <table class="version-table">
          <thead>
            <tr>
              <th>{{ t.ui5.themes.themes }}</th>
              <th>{{ t.ui5.themes.libraries }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(d) in data?.data?.themes"
              :key="d"
              :class="[data?.data?.supportedThemes?.includes(d?.name) ? 'current' : '']"
            >
              <td>
                <i
                  v-if="data?.data?.supportedThemes?.includes(d?.name)"
                  class="fa-regular fa-circle-check"
                  style="margin-left:6px;color: var(--sap-green)"
                ></i>
                <strong v-if="data?.data?.supportedThemes?.includes(d?.name)" style="color: var(--sap-green)">{{ d?.name }}</strong>
                <span v-else>{{ d?.name }}</span>
              </td>
              <td>
                <div v-if="d?.libraries.length" style="margin-top:3px;display:flex;flex-wrap:wrap;gap:3px">
                  <code
                    v-for="(l) in d.libraries"
                    :key="l"
                    style="font-size:10px;background:#f0f0f0;padding:1px 4px;border-radius:3px;color:#555"
                  >{{ l }}</code>
                </div>
              </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { toRef } from 'vue';

import { t } from '../../i18n/index.js';


export default {
  name: 'ThemesTab',
  props: { data: { type: Object, default: null } },
  setup(props) {
    const data = toRef(props, 'data');

    return { t, data };
  },
};
</script>
