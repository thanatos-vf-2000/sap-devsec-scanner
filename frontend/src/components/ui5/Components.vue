<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-brands fa-mendeley"></i> {{ t.ui5.components.title }}</div>
    <div v-if="!data" class="empty">{{ t.ui5.components.empty }}</div>
    <div v-else >
      <table class="version-table">
        <thead>
          <tr>
            <th>{{ t.ui5.name }}</th>
            <th>{{ t.ui5.library }}</th>
            <th>{{ t.ui5.components.hasownpreload }}</th>
            <th>{{ t.ui5.components.libs }}</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(component, name) in data?.data?.components" :key="name"
          >
            <td>{{ name }}</td>
            <td>{{ component.library }}</td>
            <td>{{ component.hasOwnPreload ? t.ui5.yes : t.ui5.no }}</td>
            <td>
              <span
                v-for="(value, lib, index) in component.manifestHints?.dependencies?.libs"
                :key="lib"
              >
                {{ index > 0 ? ', ' : '' }}{{ lib }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { toRef } from 'vue';

import { t } from '../../i18n/index.js';


export default {
  name: 'ComponentsTab',
  props: { data: { type: Object, default: null } },
  setup(props) {
    const data = toRef(props, 'data');

    
    return { t, data };
  },
};
</script>
