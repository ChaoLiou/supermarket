import axios from "axios";
import { readData, writeData } from "./utils";

export type Category = {
  id: number;
  name: string;
};

type ProductRaw = {
  goodsId: string;
  goodName: string;
  goodPicUrl: string;
  qtCategoryName1: string;
  qtCategoryName2: string;
  goodsBarcode: string;
  goodPrice: number;
  goodTags: { tagName: string }[];
};

export type Product = {
  /**
   * id
   */
  a: string;
  /**
   * name
   */
  b: string;
  /**
   * image
   */
  c: string;
  /**
   * barcode
   */
  e: string;
  /**
   * price
   */
  f: number;
  /**
   * size_info
   */
  g: string;
  /**
   * buyOneGetOne
   */
  i: string;
  /**
   * created_at
   */
  j: number;
};

export type ProductPrice = Pick<Product, "f" | "i" | "j"> & {
  /**
   * product_id
   */
  k: string;
  /**
   * avg_price
   */
  l: string;
  /**
   * avg_unit
   */
  m: string;
};

const BASE_URL = "https://mwebapi.pxgo.com.tw/api";
const CHANNEL = 1;
const CATEGORY_CODE = "269001";

let _token = "";
let _now = Date.now();

const _http = axios.create({
  baseURL: BASE_URL,
});

_http.interceptors.request.use((config) => {
  config.headers.setAuthorization(`Bearer ${_token}`);
  return config;
});

const login = async () => {
  try {
    const {
      data: {
        data: { token },
      },
    } = await axios.post(
      "/member/login",
      {
        username: "1",
        password: "123456",
      },
      { baseURL: BASE_URL }
    );
    _token = token;
  } catch (error) {
    console.error(login.name, error);
    throw error;
  }
};

const getShopNumber = async (): Promise<number> => {
  try {
    const body = {
      latitude: 25.08004834048742,
      longitude: 121.49907346225056,
      memberId: 1,
    };
    const response = await _http.post("/shop/getCurrentShop", body);
    const {
      data: {
        data: {
          shop: { shopNo: shopNumber },
        },
      },
    } = response;
    console.log(`${getShopNumber.name} => ${shopNumber}`);
    return shopNumber;
  } catch (error) {
    console.error(getShopNumber.name, error);
    throw error;
  }
};

const getProductCategories = async (
  shopNumber: number
): Promise<Category[]> => {
  try {
    const body = {
      channel: CHANNEL,
      shopNo: shopNumber,
    };
    const {
      data: {
        data: { fristLevelDatas: categories },
      },
    } = await _http.post("/category/goodsCategoryQuery", body);
    console.log(
      `${getProductCategories.name} => ${categories.length} categories`
    );
    return categories;
  } catch (error) {
    console.error(getProductCategories.name, error);
    throw error;
  }
};

const getCategoryProductTotal = async (
  categoryId: number,
  shopNumber: number
): Promise<number> => {
  try {
    const body = {
      categoryPage: true,
      categoryPageParams: {
        categoryId,
        priceSort: "",
        saleVolumeSort: "DESC",
        categoryCode: CATEGORY_CODE,
      },
      channel: CHANNEL,
      pageNum: 1,
      pageSize: 1,
      shopNo: shopNumber,
    };
    const {
      data: {
        data: { total },
      },
    } = await _http.post("/goods/goodsQuery", body);

    console.log(
      `${getCategoryProductTotal.name} with categoryId: ${categoryId} => ${total}`
    );
    return total;
  } catch (error) {
    console.error(getCategoryProductTotal.name, error);
    throw error;
  }
};

const getCategoryProducts = async (
  categoryId: number,
  shopNumber: number,
  total: number
): Promise<ProductRaw[]> => {
  try {
    const body = {
      categoryPage: true,
      categoryPageParams: {
        categoryId,
        priceSort: "",
        saleVolumeSort: "DESC",
        categoryCode: CATEGORY_CODE,
      },
      channel: CHANNEL,
      pageNum: 1,
      pageSize: total,
      shopNo: shopNumber,
    };
    const {
      data: {
        data: { goods: products },
      },
    } = await _http.post("/goods/goodsQuery", body);

    console.log(
      `${getCategoryProducts.name} with categoryId: ${categoryId} and total: ${total} => ${products.length} products`
    );
    return products;
  } catch (error) {
    console.error(getCategoryProducts.name, error);
    throw error;
  }
};

const saveProducts = (categoryId: number, products: Product[]) => {
  const filename = `${categoryId}/products`;
  const productsPast = readData<Product[]>(filename);
  diffNowAndPastProducts(products, productsPast);
  writeData(filename, products);
};

const saveProductPrices = (categoryId: number, products: Product[]) => {
  const filename = `${categoryId}/product_prices`;
  const productPricesNow = products.map(formatter.formatProductPrice);
  const productPricesPast = readData<ProductPrice[]>(filename);
  const { productPricesNeedToCreate } = diffNowAndPastProductPrices(
    productPricesNow,
    productPricesPast
  );
  writeData(filename, productPricesPast.concat(productPricesNeedToCreate));
};

const saveAllProducts = async (categoryIds: number[], shopNumber: number) => {
  try {
    await categoryIds.reduce(
      (prev, categoryId) =>
        prev
          .then(() => getCategoryProductTotal(categoryId, shopNumber))
          .then((total) => getCategoryProducts(categoryId, shopNumber, total))
          .then((productsRaw) => {
            const products = productsRaw.map(formatter.formatProduct);
            saveProducts(categoryId, products);
            saveProductPrices(categoryId, products);
          })
          .then(() => new Promise((resolve) => setTimeout(resolve, 1000))),
      Promise.resolve([] as ProductRaw[])
    );
  } catch (error) {
    console.error(saveAllProducts.name, error);
    throw error;
  }
};

const formatter = {
  formatSizeInfo(name: string) {
    return [
      ...name.matchAll(
        /.(\d+(\.\d+)?\s?(ml|l|g|kg|cc|ML|L|G|KG|CC|入|抽|片|粒|張|包|組|捲|克|公克|斤|公斤|豪升|毫升|公升|升|杯))/gi
      ),
    ]
      .filter((x, i) => {
        if (i === 0) {
          return !x[0].startsWith("每");
        } else {
          return !x[0].startsWith("每") && x[0].startsWith("*");
        }
      })
      .map((x) => x[1])
      .join(";");
  },
  formatImage(url: string) {
    try {
      const urlObj = new URL(url);
      return urlObj.pathname;
    } catch {}
    return url;
  },
  formatProduct(product: ProductRaw): Product {
    return {
      a: product.goodsId,
      b: product.goodName,
      c: formatter.formatImage(product.goodPicUrl),
      e: product.goodsBarcode,
      f: product.goodPrice,
      g: formatter.formatSizeInfo(product.goodName),
      i: (product.goodTags ?? []).some((x) => x.tagName.includes("買一送一"))
        ? "Y"
        : "N",
      j: _now,
    };
  },
  formatAvgPrice(price: number, sizeInfo: string, buyOneGetOne: string) {
    let unit = "";
    let _price = buyOneGetOne === "Y" ? price / 2 : price;
    const total = sizeInfo.split(";").reduce((prev, x) => {
      const result = /^(\d+)(.*?)$/.exec(x) ?? [];
      let n = "0";
      if (result) {
        [, n] = result;
        const [, , u] = result;
        if (u) {
          const _u = u.toLowerCase();
          if (
            "ml|l|g|kg|cc|克|公克|斤|公斤|豪升|毫升|公升"
              .split("|")
              .includes(_u)
          ) {
            unit = _u;
          }
        }
      }
      return prev * parseFloat(n);
    }, 1);
    if (["ml", "g", "cc", "克", "公克", "毫升", "豪升"].includes(unit)) {
      const avg_price = ((_price * 100) / total).toFixed(2);
      const avg_unit = `100 ${unit}`;
      return {
        avg_price,
        avg_unit,
      };
    } else if (["l", "kg", "公升", "公斤", "斤"].includes(unit)) {
      const avg_price = (_price / total).toFixed(2);
      const avg_unit = `1 ${unit}`;
      return {
        avg_price,
        avg_unit,
      };
    } else if (total) {
      const avg_price = (_price / total).toFixed(2);
      const avg_unit = `1 單位`;
      return {
        avg_price,
        avg_unit,
      };
    }
    return {
      avg_price: "0",
      avg_unit: "",
    };
  },
  distinct(products: Product[]) {
    return products.reduce((prev, curr) => {
      if (prev.every((x) => x.a !== curr.a)) {
        prev.push(curr);
      }
      return prev;
    }, [] as Product[]);
  },
  formatProductPrice(product: Product): ProductPrice {
    const { avg_price, avg_unit } = formatter.formatAvgPrice(
      product.f,
      product.g,
      product.i
    );
    return {
      k: product.a,
      f: product.f,
      i: product.i,
      l: avg_price,
      m: avg_unit,
      j: _now,
    };
  },
};

const diffNowAndPastProducts = (
  productsNow: Product[],
  productsPast: Product[]
) => {
  const productIdsPast = productsPast.map((x) => x.a);
  const productIdsNow = productsNow.map((x) => x.a);

  const productsNeedToCreate = productsNow.filter(
    (x) => !productIdsPast.includes(x.a)
  );
  const productIdsNeedToCreate = productsNeedToCreate.map((x) => x.a);

  const productsNeedToDelete = productsPast.filter(
    (x) => !productIdsNow.includes(x.a)
  );
  const productIdsReadyToDelete = productsNeedToDelete.map((x) => x.a);

  const productsNowStayStill = productsNow.filter(
    (x) => !productIdsNeedToCreate.includes(x.a)
  );
  const productsPastStayStill = productsPast.filter(
    (x) => !productIdsReadyToDelete.includes(x.a)
  );

  const productsNeedToUpdate = productsNowStayStill.filter((productNow) => {
    const productPast = productsPastStayStill.find((x) => x.a === productNow.a);
    if (productPast) {
      return (Object.keys(productPast) as (keyof Product)[])
        .filter((key) => !["j"].includes(key))
        .some((key) => productNow[key] !== productPast[key]);
    }
    return false;
  });

  console.log(`past: ${productIdsPast.length}, now: ${productIdsNow.length}`);
  console.log(
    `create: ${productsNeedToCreate.length}, delete: ${productsNeedToDelete.length}, update: ${productsNeedToUpdate.length}`
  );

  return {
    productsNeedToCreate,
    productsNeedToDelete,
    productsNeedToUpdate,
  };
};

const diffNowAndPastProductPrices = (
  productPricesNow: ProductPrice[],
  productPricesPast: ProductPrice[]
) => {
  const productPricesNeedToCreate = productPricesNow.filter(
    (productPriceNow) => {
      const productPricePast = productPricesPast.find(
        (productPricePast) => productPricePast.k === productPriceNow.k
      );
      return !productPricePast || productPricePast.f !== productPriceNow.f;
    }
  );
  console.log(
    `past: ${productPricesPast.length}, now: ${productPricesNow.length}`
  );
  console.log(`create: ${productPricesNeedToCreate.length}`);

  return {
    productPricesNeedToCreate,
  };
};

const main = async () => {
  await login();
  const shopNumber = await getShopNumber();
  const categories = await getProductCategories(shopNumber);
  const categoryIds = categories.map((x) => x.id);
  writeData(
    "categories",
    categories.map((x) => ({ a: x.id, b: x.name }))
  );
  await saveAllProducts(categoryIds, shopNumber);
};

main();
