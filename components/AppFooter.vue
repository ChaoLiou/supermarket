<script setup lang="ts">
const names: string[] = ["index", "hots"];
const route = useRoute();

const active = ref(0);

const show = computed(() => {
  if (route.name && names.includes(route.name as string)) return true;
  return false;
});
</script>

<template>
  <van-tabbar v-if="show" v-model="active" route placeholder fixed>
    <van-tabbar-item replace to="/">
      <span>Home</span>
      <template #icon> </template>
    </van-tabbar-item>
    <van-tabbar-item replace to="/hots">
      <span>Hots</span>
      <template #icon> </template>
    </van-tabbar-item>
  </van-tabbar>
</template>
