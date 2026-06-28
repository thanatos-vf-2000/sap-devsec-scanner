<template>
  <div>
    <Header />
    <main class="main">
      <div class="card">
        <h1>Page UI5</h1>
      </div>
    </main>
    <Footer />
  </div>
</template>
<script setup>
import { useRoute } from 'vue-router'
import Header from '../components/ui/Header.vue';
import Footer from '../components/ui/Footer.vue';

const route = useRoute()

console.log(route.params.version)
</script>