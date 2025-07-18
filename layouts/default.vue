<script setup lang="ts"></script>

<template>
  <main class="flex flex-col min-h-svh">
    <AppHeader class="h-[var(--van-nav-bar-height)]" />
    <div class="p-16 pb-[var(--van-nav-bar-height)] flex-1">
      <slot />
    </div>
    <AppFooter />
  </main>
</template>

<style lang="css">
:root {
  --color-primary: hsl(219, 50%, 10%);
  --color-secondary: hsl(219, 50%, 90%);
  --color-tertiary: hsl(279, 80%, 80%);
  --color-accent: hsl(159, 80%, 80%);
}
body {
  font-family: "Noto Sans TC", sans-serif;
  font-optical-sizing: auto;
  color: var(--color-primary);
  font-style: normal;
}
</style>
