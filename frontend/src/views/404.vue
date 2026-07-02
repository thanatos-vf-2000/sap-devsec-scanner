<template>
    <Header />
    <main class="main">
      <div class="card e404">
        <div>
          <h1>{{ t.e404.code }}</h1>
          <p>{{ t.e404.message }}</p>
          <p class="url">
            {{ t.e404.url_request }}: <strong>{{ currentUrl }}</strong> ({{ route.fullPath }})
          </p>
        </div>
      </div> 
    </main>
    <Footer />
</template>
<script>
import { t } from '../i18n/index.js';
import { useRoute } from 'vue-router';

import Header from '../components/ui/Header.vue';
import Footer from '../components/ui/Footer.vue';

export default {
  name: 'e404',
  components: {
    Header,
    Footer,
  },
  props: { data: { type: Object, default: null } },
  setup() { 
    const route = useRoute();
    const currentUrl = window.location.href;
    return { t, route, currentUrl }; 
  },
};

</script>
<style>
.e404 { text-align: center; color: var(--sap-critical); }
.e404 h1 { font-size: 100px; }
.e404 p { font-size: 25px; }
.e404 p.url { font-size: 10px; color: var(--sap-gray); }
</style>