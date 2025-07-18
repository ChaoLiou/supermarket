<script lang="ts" setup>
import { CellGroup, Cell } from "vant";

const { data, error } = await useFetch("/api/categories");
</script>

<template>
  <CellGroup>
    <Cell>
      {{ data }}
    </Cell>
  </CellGroup>
</template>

<style lang="scss" scoped></style>
