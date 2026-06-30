<template>
  <div>
    <div class="font-bold mb-8"><i class="fa-regular fa-map"></i> {{ t.ui5.libraries.title }}</div>
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

    return { t, data };
  },
};
</script>
