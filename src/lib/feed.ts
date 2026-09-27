import { XMLParser } from "fast-xml-parser";

export type RSSFeed = {
  channel: {
    title: string;
    link: string;
    description: string;
    item: RSSItem[];
  };
};

export type RSSItem = {
  title: string;
  link: string;
  description: string;
  pubDate: string;
};

export async function fetchFeed(feedURL: string): Promise<RSSFeed> {
  const res = await fetch(feedURL, {
    headers: {
      "User-Agent": "gator",
    },
  });
  const xml = await res.text();

  const parser = new XMLParser({
    processEntities: false,
  });
  const data = parser.parse(xml);

  const channel = data?.rss?.channel;
  if (!channel) {
    throw new Error("feed is missing a channel field");
  }

  const { title, link, description } = channel;
  if (
    typeof title !== "string" ||
    typeof link !== "string" ||
    typeof description !== "string"
  ) {
    throw new Error("feed channel is missing required metadata");
  }

  const rawItems = channel.item;
  const rawItemList: any[] = Array.isArray(rawItems)
    ? rawItems
    : rawItems
    ? [rawItems]
    : [];

  const items: RSSItem[] = [];
  for (const item of rawItemList) {
    if (
      typeof item?.title === "string" &&
      typeof item?.link === "string" &&
      typeof item?.description === "string" &&
      typeof item?.pubDate === "string"
    ) {
      items.push({
        title: item.title,
        link: item.link,
        description: item.description,
        pubDate: item.pubDate,
      });
    }
  }

  return {
    channel: {
      title,
      link,
      description,
      item: items,
    },
  };
}
