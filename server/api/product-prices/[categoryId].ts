import { readData } from "~/ops/utils";

export default defineEventHandler(async (event) => {
  const { categoryId } = event.context.params ?? {};
  if (categoryId) {
    const filename = `${categoryId}/product_prices`;
    return readData(filename);
  }
  return [];
});
