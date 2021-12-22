import { readFile } from "fs/promises";

const path = require("path");

// keys.jsonの内容を取得
export const getKeys = async () => {
  const keyReader = readFile(path.join(__dirname, "./token.json"), "utf-8");
  return JSON.parse(await keyReader);
};
