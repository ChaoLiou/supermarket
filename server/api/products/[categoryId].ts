import { readData } from "~/ops/utils";

export default defineEventHandler(async (event) => {
  const { categoryId } = event.context.params ?? {};
  if (categoryId) {
    const filename = `${categoryId}/products`;
    return readData(filename);
  }
  return [];
});
