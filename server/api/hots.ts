import type { Product } from "~/ops/pxgo";
import type { ProductPriceHistory } from "~/ops/pxgo-history";
import { readData } from "~/ops/utils";

export default defineEventHandler(async () => {
  const now = new Date();
  const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const categories = readData<{ a: number; b: string }[]>("categories");
  return categories
    .map((category) => {
      const productPriceHistories = readData<ProductPriceHistory[]>(
        `${category.a}/product_price_histories`
      );
      return productPriceHistories
        .filter(
          (x) => x.a.length > 1 && x.a.filter((y) => y.j > midnight.getTime())
        )
        .map((x) => {
          const products = readData<Product[]>(`${category.a}/products`);
          const target = products.find((product) => product.a === x.k);
          return {
            ...x,
            a: x.a.slice(x.a.length - 2, x.a.length),
            b: target?.b,
            c: target?.c,
          };
        });
    })
    .flat();
});
