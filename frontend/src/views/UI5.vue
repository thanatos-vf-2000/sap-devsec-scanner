<template>
  <div>
    <Header />
    <main class="main">
      <div class="card">
        <h1>{{ t.ui5.title }}: <strong>{{ route.params.version }}</strong></h1>
        <p>{{ t.ui5.build }}: {{ formatBuildTimestamp(ui5?.data?.buildTimestamp) }}
        </p>
        <select v-model="selectedVersion">
          <option
            v-for="v in ltsVersions"
            :key="v.version"
            :value="v.version"
          >
            {{ v.version }} (LTS)
          </option>
        </select>
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
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';

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
    const router = useRouter();

    const selectedVersion = ref(route.params.version);

    const ui5 = ref(null);
    const versions = ref(null);
    const ltsVersions = ref(null);
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
    };

    async function loadVersions() {
      loading.value = true;
      error.value = null;

      try {
        const response = await fetch(`/api/sap/ui5/version`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        versions.value = data.data;

        ltsVersions.value = Object.values(data.data || {})
          .filter(v => v.lts === true)
          .sort((a, b) =>
            b.version.localeCompare(a.version)
        );
        
      } catch (e) {
        error.value = e.message;
      } finally {
        loading.value = false;
      }
    }

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

    onMounted(async () => {
      await Promise.all([
        loadUI5(),
        loadVersions(),
      ]);
    });

    watch(selectedVersion, (newVersion) => {
      if (!newVersion) return;
      router.push(`/ui5/${newVersion}`);
      loading.value = true;

      window.location.href = `/ui5/${newVersion}`;

    });

    return { t, route, ui5,
            versions, ltsVersions, selectedVersion,
            loading, error,
            currentTab, tabs, formatBuildTimestamp };
  },
  
};
</script>