import { readData } from "~/ops/utils";

export default defineEventHandler(async (event) => {
  const { categoryId } = event.context.params ?? {};
  if (categoryId) {
    const filename = `${categoryId}/product_price_histories`;
    return readData(filename);
  }
  return [];
});
