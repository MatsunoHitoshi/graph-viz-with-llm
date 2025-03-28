import fs from "fs";
import { env } from "@/env";

export const writeFile = (base64: string, name: string) => {
  const path = `${env.TMP_DIRECTORY}/${new Date().getTime()}_${name}`;
  const bin = atob(base64.replace(/^.*,/, ""));
  const buffer = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    buffer[i] = bin.charCodeAt(i);
  }

  try {
    // fs.writeFileSync(path, new Uint8Array(buffer));
    return path;
  } catch (e) {
    console.log("failed to write file");
    throw e;
  }
};

export const exportJson = (jsonString: string, name: string) => {
  const path = `./public/json/${new Date().getTime()}_${name}`;
  // fs.writeFileSync(path, jsonString);
};
