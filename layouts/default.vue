<script setup lang="ts">
import "vant/lib/index.css";
import AppFooter from "~/components/AppFooter.vue";
</script>

<template>
  <main class="flex flex-col min-h-svh">
    <slot />
    <AppFooter />
  </main>
</template>

<style lang="css">
body {
  font-family: "Noto Sans TC", sans-serif;
  font-optical-sizing: auto;
  font-style: normal;
}
</style>
