<template>
  <div>
    <Header />
    <main class="main">
      <div class="card">
        <h1>{{ t.ui5.title }}: <strong>{{ route.params.version }}</strong></h1>
      </div>
      <!-- Tabs Card -->
      <div class="card" style="padding-bottom:0">
        <div class="section-tabs">
          <div
            v-for="tab in tabs"
            :key="tab.id"
            class="section-tab"
            :class="{ active: currentTab === tab.id }"
            @click="currentTab = tab.id"
          >
            <i :class="tab.icon"></i> {{ tab.label }}

          </div>
        </div>
        <div style="padding-bottom:20px">
          <div v-if="loading">{{ t.ui5.loading }}</div>
          <div v-else-if="error">{{ error }}</div>
          <template v-else>
            <LibTab v-if="currentTab === 'libraries'" :data="ui5" />
            <ComponentsTab  v-if="currentTab === 'components'" :data="ui5" />
            <ThemesTab  v-if="currentTab === 'themes'" :data="ui5" />
            <AboutTab v-else-if="currentTab === 'about'" :data="ui5" />
          </template>
        </div>
      </div>
    </main>
    <Footer />
  </div>
</template>
<script>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

import Header from '../components/ui/Header.vue';
import LibTab from '../components/ui5/Libraries.vue';
import ComponentsTab from '../components/ui5/Components.vue';
import ThemesTab from '../components/ui5/Themes.vue';
import AboutTab from '../components/ui5/About.vue';
import Footer from '../components/ui/Footer.vue';

import { t } from '../i18n/index.js';

export default {
  name: 'UI5',
  components: {
    Header,
    LibTab,
    ComponentsTab,
    ThemesTab,
    AboutTab,
    Footer
  },
  setup() {
    const route = useRoute();

    const ui5 = ref(null);
    const loading = ref(true);
    const error = ref(null);

    console.log(route.params.version);

    const tabs =  [
      { id: 'libraries', label: t.ui5.libraries.title, icon: 'fa-solid fa-book' },
      { id: 'components', label: t.ui5.components.title, icon: 'fa-brands fa-mendeley' },
      { id: 'themes', label: t.ui5.themes.title, icon: 'fa-solid fa-desktop' },
      { id: 'about', label: t.ui5.about.title, icon: 'fa-solid fa-info' },
    ];

    const currentTab = ref('libraries');

    async function loadUI5() {
      loading.value = true;
      error.value = null;

      try {
        const response = await fetch(`/api/sap/ui5/resources/${route.params.version}`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        ui5.value = await response.json();
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    }

    onMounted(loadUI5);

    return { t, route, ui5,
            loading, error,
            currentTab, tabs };
  },
};
</script>