import type { ProductPrice } from "./pxgo";
import { readData, writeData } from "./utils";

export type ProductPriceHistory = Omit<ProductPrice, "f" | "l" | "m" | "j"> & {
  a: Pick<ProductPrice, "f" | "l" | "m" | "j">[];
};

const groupPriceHistory = (productPrices: ProductPrice[]) =>
  productPrices.reduce((prev, curr) => {
    const target = prev.find((x) => x.k === curr.k);
    if (target) {
      target.a.push({
        f: curr.f,
        l: curr.l,
        m: curr.m,
        j: curr.j,
      });
      target.i = curr.i;
    } else {
      prev.push({
        k: curr.k,
        i: curr.i,
        a: [
          {
            f: curr.f,
            l: curr.l,
            m: curr.m,
            j: curr.j,
          },
        ],
      });
    }
    return prev;
  }, [] as ProductPriceHistory[]);

const main = () => {
  const categories = readData<{ a: number; b: string }[]>("categories");
  categories.forEach((category) => {
    const filename = `${category.a}/product_prices`;
    const productPrices = readData<ProductPrice[]>(filename);
    const productPriceHistories = groupPriceHistory(productPrices);
    writeData(`${category.a}/product_price_histories`, productPriceHistories);
  });
};

main();
