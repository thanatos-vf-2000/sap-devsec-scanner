<template>
    <footer class="footer">
        <div>App v{{ APP_VERSION }} · UI v{{ UI_VERSION }} (node: {{ NODE_ENV }} - build: {{ BUILD_NUMBER }})</div>
        <div>Build: {{ buildTime }}</div>
        <div>Commit: {{ GIT_HASH }}</div>
    </footer>
</template>
<script setup>
const APP_VERSION = __APP_VERSION__;
const UI_VERSION = __UI_VERSION__;
const GIT_HASH = __GIT_HASH__;

const buildTime = new Date(__BUILD_TIME__).toLocaleString();

const NODE_ENV = __NODE_ENV__;
const BUILD_NUMBER = __BUILD_NUMBER__;
</script>