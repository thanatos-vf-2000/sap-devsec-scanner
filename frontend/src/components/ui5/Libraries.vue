<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-regular fa-map"></i> {{ t.ui5.libraries.title }}</div>
    <div v-if="!data" class="empty">{{ t.ui5.libraries.empty }}</div>
    <div v-else >
      <table class="version-table">
        <thead>
          <tr>
            <th>{{ t.ui5.name }}</th>
            <th>{{ t.ui5.libraries.version }}</th>
            <th>{{ t.ui5.libraries.deprecated }}</th>
            <th>{{ t.ui5.libraries.npmpackagename }}</th>
            <th>{{ t.ui5.libraries.themes }}</th>
          </tr>
        </thead>
        <tbody>
          <template 
            v-for="(l) in data?.data?.libraries" 
            :key="l"
          >
            <tr>
              <td>{{ l?.name }}</td>
              <td>{{ l?.version }}</td>
              <td>{{ l?.deprecated ? t.ui5.yes : t.ui5.no }}</td>
              <td>{{ l?.npmPackageName }}</td>
              <td>
                <span
                  v-for="(th, index) in l?.themes"
                >
                  {{ index > 0 ? ', ' : '' }}{{ th }}
                </span>
              </td>
            </tr>
            <tr>
              <td colspan="5">
                <div>
                  <strong>{{ t.ui5.libraries.component }}: </strong> {{ getComponent(l?.appData) }}
                </div>
                <div>
                  <strong>{{ t.ui5.build }}: </strong> {{ formatBuildTimestamp(l?.buildTimestamp) }}
                </div>
                <div>
                  <strong>{{ t.ui5.libraries.vendor }}: </strong>{{ l?.vendor }}
                </div>
                <div>
                  <strong>{{ t.ui5.libraries.documentation }}: </strong>{{ l?.documentation }}
                </div>
                <div>
                  <strong>{{ t.ui5.libraries.copyright }}: </strong>{{ l?.copyright }}
                </div>
              </td>
            </tr>
          </template>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { toRef } from 'vue';

import { t } from '../../i18n/index.js';


export default {
  name: 'LibTab',
  props: { data: { type: Object, default: null } },
  setup(props) {
    const data = toRef(props, 'data');

    function formatBuildTimestamp(timestamp) {
      if (!timestamp) return '';

      const str = String(timestamp);

      const year = str.slice(0, 4);
      const month = str.slice(4, 6);
      const day = str.slice(6, 8);
      const hour = str.slice(8, 10);
      const minute = str.slice(10, 12);

      return `${day}/${month}/${year} ${hour}:${minute}`;
    };

    function getComponent(appData) {
      if (!appData) return null;

      const parser = new DOMParser();
      const xml = parser.parseFromString(appData, "application/xml");

      return xml.querySelector("ownership > component")?.textContent ?? null;
    };

    return { t, data, formatBuildTimestamp, getComponent };
  },
};
</script>
