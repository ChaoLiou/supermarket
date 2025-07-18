import type { ProductPriceHistory } from "~/ops/pxgo-history";
import { readData } from "~/ops/utils";

export default defineEventHandler(async () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const categories = readData<{ a: number; b: string }[]>("categories");
  return categories
    .map((x) => {
      const productPriceHistories = readData<ProductPriceHistory[]>(
        `${x.a}/product_price_histories`
      );
      return productPriceHistories.filter(
        (x) =>
          x.history.length > 1 &&
          x.history.filter((y) => y.j > midnight.getTime())
      );
    })
    .flat();
});
