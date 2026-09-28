import { setUser, readConfig } from "./config";
import { createUser, getUserByName, deleteAllUsers, getUsers } from "./lib/db/queries/users";
import { fetchFeed } from "./lib/feed";
import { createFeed, getFeeds, getFeedByUrl } from "./lib/db/queries/feeds";
import type { User, Feed } from "./lib/db/schema";
import { createFeedFollow, getFeedFollowsForUser } from "./lib/db/queries/feed_follows";

type CommandHandler = (cmdName: string, ...args: string[]) => Promise<void>;

type CommandsRegistry = Record<string, CommandHandler>;

type UserCommandHandler = (
  cmdName: string,
  user: User,
  ...args: string[]
) => Promise<void>;

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

async function handlerReset(cmdName: string, ...args: string[]): Promise<void> {
  await deleteAllUsers();
  console.log("Database has been reset");
}
function registerCommand(
  registry: CommandsRegistry,
  cmdName: string,
  handler: CommandHandler
): void {
  registry[cmdName] = handler;
}

function middlewareLoggedIn(handler: UserCommandHandler): CommandHandler {
  return async (cmdName: string, ...args: string[]) => {
    const config = readConfig();
    const user = await getUserByName(config.currentUserName);
    if (!user) {
      throw new Error(`User ${config.currentUserName} not found`);
    }
    await handler(cmdName, user, ...args);
  };
}
async function handlerUsers(cmdName: string, ...args: string[]): Promise<void> {
  const config = readConfig();
  const allUsers = await getUsers();

  for (const user of allUsers) {
    if (user.name === config.currentUserName) {
      console.log(`* ${user.name} (current)`);
    } else {
      console.log(`* ${user.name}`);
    }
  }
}
async function handlerAgg(cmdName: string, ...args: string[]): Promise<void> {
  const feed = await fetchFeed("https://www.wagslane.dev/index.xml");
  console.log(JSON.stringify(feed, null, 2));
}

function printFeed(feed: Feed, user: User): void {
  console.log(`* ID:      ${feed.id}`);
  console.log(`* Created: ${feed.createdAt}`);
  console.log(`* Updated: ${feed.updatedAt}`);
  console.log(`* Name:    ${feed.name}`);
  console.log(`* URL:     ${feed.url}`);
  console.log(`* User:    ${user.name}`);
}

async function handlerAddFeed(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 2) {
    throw new Error(`usage: ${cmdName} <name> <url>`);
  }
  const [name, url] = args;

  const feed = await createFeed(name, url, user.id);
  console.log("Feed created successfully:");
  printFeed(feed, user);

  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`${feedFollow.userName} is now following ${feedFollow.feedName}`);
}

async function handlerFollow(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  if (args.length < 1) {
    throw new Error(`usage: ${cmdName} <url>`);
  }
  const [url] = args;

  const feed = await getFeedByUrl(url);
  if (!feed) {
    throw new Error(`feed with url ${url} not found`);
  }

  const feedFollow = await createFeedFollow(user.id, feed.id);
  console.log(`${feedFollow.userName} is now following ${feedFollow.feedName}`);
}

async function handlerFollowing(
  cmdName: string,
  user: User,
  ...args: string[]
): Promise<void> {
  const follows = await getFeedFollowsForUser(user.id);
  for (const follow of follows) {
    console.log(`* ${follow.feedName}`);
  }
}

async function handlerFeeds(cmdName: string, ...args: string[]): Promise<void> {
  const allFeeds = await getFeeds();

  for (const feed of allFeeds) {
    console.log(`* Name: ${feed.name}`);
    console.log(`  URL:  ${feed.url}`);
    console.log(`  User: ${feed.userName}`);
  }
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
  registerCommand(registry, "reset", handlerReset);
  registerCommand(registry, "users", handlerUsers);
  registerCommand(registry, "agg", handlerAgg);
  registerCommand(registry, "addfeed", middlewareLoggedIn(handlerAddFeed));
  registerCommand(registry, "feeds", handlerFeeds);
  registerCommand(registry, "follow", middlewareLoggedIn(handlerFollow));
  registerCommand(registry, "following", middlewareLoggedIn(handlerFollowing));

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
