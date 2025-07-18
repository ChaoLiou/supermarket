<script lang="ts" setup>
const { data, error } = await useFetch("/api/categories");
</script>

<template>
  <div>{{ data }}</div>
</template>

<style lang="scss" scoped></style>
