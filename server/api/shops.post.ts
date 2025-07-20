import axios from "axios";

const BASE_URL = "https://mwebapi.pxgo.com.tw/api";

export default defineEventHandler(async (event) => {
  const { coords } = await readBody(event);
  const http = axios.create({
    baseURL: BASE_URL,
  });
  const {
    data: {
      data: { token },
    },
  } = await http.post("/member/login", {
    username: "1",
    password: "123456",
  });
  const {
    data: {
      data: { shopList },
    },
  } = await http.post("/shop/getShopMainList", coords, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return shopList;
});
