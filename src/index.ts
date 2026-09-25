import { setUser } from "./config";

type CommandHandler = (cmdName: string, ...args: string[]) => void;

type CommandsRegistry = Record<string, CommandHandler>;

function handlerLogin(cmdName: string, ...args: string[]): void {
  if (args.length === 0) {
    throw new Error(`usage: ${cmdName} <username>`);
  }
  const username = args[0];
  setUser(username);
  console.log(`User has been set to ${username}`);
}

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): void {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }
  handler(cmdName, ...args);
}

function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);

  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("usage: cli <command> [args...]");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;

  try {
    runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    process.exit(1);
  }
}

main();
