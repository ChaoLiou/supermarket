import * as fs from "fs";
import * as path from "path";

export const readData = <T>(filename: string) => {
  const filepath = `./data/${filename}.json`;
  let data = [];
  if (fs.existsSync(filepath)) {
    data = JSON.parse(fs.readFileSync(filepath, { encoding: "utf-8" }));
  }
  return data as T;
};

export const writeData = <T>(filename: string, data: T) => {
  const filepath = `./data/${filename}.json`;
  fs.mkdirSync(path.dirname(filepath), { recursive: true });
  fs.writeFileSync(filepath, JSON.stringify(data));
};
