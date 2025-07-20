<script lang="ts" setup>
import dayjs from "dayjs";
import { useGeolocation } from "@vueuse/core";
import { type Shop } from "~/@types";

const {
  coords, // 包含 latitude, longitude, accuracy 等資訊
  locatedAt, // 最後定位的時間
  error, // 如果失敗，這裡會有錯誤訊息
  resume, // 重新啟動定位
  pause, // 暫停定位
  isSupported, // 是否支援 geolocation API
} = useGeolocation();

const { data: _data } = await useFetch("/api/hots");

const data = computed(() =>
  (_data.value ?? [])
    .map((x) => {
      return {
        originPrice: x.a[0].f,
        price: x.a[1].f,
        title: x.b,
        desc: `${dayjs(x.a[1].j).diff(dayjs(x.a[0].j), "days")} 天前`,
        thumb: `https://image.pxgo.com.tw/${x.c}`,
      };
    })
    .map((x) => ({
      ...x,
      priceDiff: x.price - x.originPrice,
    }))
    .map((x) => ({
      ...x,
      tag: `${x.priceDiff > 0 ? "+" : "-"}` + ` NT.${Math.abs(x.priceDiff)}`,
      class: x.priceDiff > 0 ? "price-up" : "price-down",
    }))
    .sort((a, b) => a.priceDiff - b.priceDiff)
);

const shops = ref<Shop[]>([]);

const getShops = async () => {
  const { data } = await useFetch("/api/shops", {
    method: "POST",
    body: {
      coords: {
        latitude: coords.value.latitude,
        longitude: coords.value.longitude,
      },
    },
  });
  shops.value = data.value;
};
</script>

<template>
  <v-btn @click="getShops"> Get Shops </v-btn>
  {{ coords }}
  {{ shops }}
</template>

<style lang="css" scoped></style>
