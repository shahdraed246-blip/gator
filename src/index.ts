import { setUser } from "./config";
import { createUser, getUserByName } from "./lib/db/queries/users";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>;

async function handlerLogin(cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    throw new Error(`usage: ${cmdName} <username>`);
  }
  const username = args[0];

  const existingUser = await getUserByName(username);
  if (!existingUser) {
    throw new Error(`user ${username} does not exist`);
  }

  setUser(username);
  console.log(`User has been set to ${username}`);
}

async function handlerRegister(cmdName: string, ...args: string[]): Promise<void> {
  if (args.length === 0) {
    throw new Error(`usage: ${cmdName} <username>`);
  }
  const username = args[0];

  const existingUser = await getUserByName(username);
  if (existingUser) {
    throw new Error(`user ${username} already exists`);
  }

  const user = await createUser(username);
  setUser(username);
  console.log(`User ${username} was created`);
  console.log(user);
}

function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

async function runCommand(
  registry: CommandsRegistry,
  cmdName: string,
  ...args: string[]
): Promise<void> {
  const handler = registry[cmdName];
  if (!handler) {
    throw new Error(`unknown command: ${cmdName}`);
  }
  await handler(cmdName, ...args);
}

async function main() {
  const registry: CommandsRegistry = {};
  registerCommand(registry, "login", handlerLogin);
  registerCommand(registry, "register", handlerRegister);

  const args = process.argv.slice(2);
  if (args.length < 1) {
    console.error("usage: cli <command> [args...]");
    process.exit(1);
  }

  const [cmdName, ...cmdArgs] = args;

  try {
    await runCommand(registry, cmdName, ...cmdArgs);
  } catch (err) {
    if (err instanceof Error) {
      console.error(err.message);
    } else {
      console.error(err);
    }
    process.exit(1);
  }

  process.exit(0);
}

main();
