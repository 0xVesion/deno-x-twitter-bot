import { GithubApi, GithubService } from "./src/github.ts";
import { BotDatabase, DenoXEntryMap, DenoXEntry } from "./src/db.ts";
import { IFTTTApi } from "./deps.ts";
import { currentISODate } from "./src/util.ts";

const db = new BotDatabase();
const githubApi = new GithubApi(Deno.env.get("BOT_GITHUB_TOKEN") || "");
const ifttt = new IFTTTApi(Deno.env.get("BOT_IFTTT_TOKEN") || "");
const githubService = new GithubService(
  githubApi,
  "denoland",
  "deno_website2",
  "/database.json",
);


while(true) {
  try {
    await run();
  } catch(e) {
    console.error(e);
  }

  await new Promise((res, rej) => setTimeout(() => res(), 1000 * 60 * 15));
}

async function run(): Promise<void> {
  const data = await db.get();

  const hasNewCommits =
    (await githubService.getAllCommits(data.lastUpdate)).length > 0;

  if (!hasNewCommits) {
    console.log("No new commits found!");

    return;
  }

  const entries: DenoXEntry[] = Object
    .entries(await githubService.getFile() as DenoXEntryMap)
    .map(([name, entry]) => ({ ...entry, name }));

  const newEntries = entries.filter((e) =>
    data.entries.filter((ee) => ee.owner === e.owner && ee.repo === e.repo)
      .length === 0
  );

  console.log(`Found ${newEntries.length} new entries!`);

  for (const entry of newEntries) {
    const { owner, repo, desc, name } = entry;

    const tweetTitle = `${owner} added ${name} to #denojs X`;

    console.log(`Tweeting: ${tweetTitle}`);

    const response = await ifttt.trigger(
      "tweet",
      `${tweetTitle}\n${desc}\nYou can visit it on https://deno.land/x/${name}\nhttps://github.com/${owner}/${repo}`,
    );

    console.log(response);

    await new Promise((r) => setTimeout(() => r(), 1000));
  }

  data.entries = [...data.entries, ...newEntries];
  data.lastUpdate = currentISODate();

  await db.set(data);
}
