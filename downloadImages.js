import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const json = fs.readFileSync(
  path.join(__dirname, "src", "data", "athletes.json"),
  "utf8"
);

const athletes = JSON.parse(json);

console.log("Total Athletes:", athletes.length);

athletes.forEach((athlete, index) => {
  console.log(index + 1, athlete.name);
});