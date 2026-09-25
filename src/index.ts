import { readConfig, setUser } from "./config";

function main() {
  setUser("Shahd");

  const config = readConfig();
  console.log(config);
}

main();
