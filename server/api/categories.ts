import { readData } from "~/ops/utils";

export default defineEventHandler(async () => {
  return readData("categories");
});
