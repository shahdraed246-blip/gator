import fs from "fs";
import os from "os";
import path from "path";

export type Config = {
  dbUrl: string;
  currentUserName: string;
};

const CONFIG_FILE_NAME = ".gatorconfig.json";

function getConfigFilePath(): string {
  return path.join(os.homedir(), CONFIG_FILE_NAME);
}

function writeConfig(cfg: Config): void {
  const rawConfig = {
    db_url: cfg.dbUrl,
    current_user_name: cfg.currentUserName,
  };
  fs.writeFileSync(getConfigFilePath(), JSON.stringify(rawConfig, null, 2), {
    encoding: "utf-8",
  });
}

function validateConfig(rawConfig: any): Config {
  if (typeof rawConfig.db_url !== "string") {
    throw new Error("db_url is missing or not a string in config file");
  }
  if (typeof rawConfig.current_user_name !== "string") {
    throw new Error("current_user_name is missing or not a string in config file");
  }

  return {
    dbUrl: rawConfig.db_url,
    currentUserName: rawConfig.current_user_name,
  };
}

function readRawConfig(): any {
  const fullPath = getConfigFilePath();
  const data = fs.readFileSync(fullPath, { encoding: "utf-8" });
  return JSON.parse(data);
}

export function readConfig(): Config {
  const rawConfig = readRawConfig();
  return validateConfig(rawConfig);
}

export function setUser(userName: string): void {
  const rawConfig = readRawConfig();
  const cfg: Config = {
    dbUrl: rawConfig.db_url,
    currentUserName: userName,
  };
  writeConfig(cfg);
}
