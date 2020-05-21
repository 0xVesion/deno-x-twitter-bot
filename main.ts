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

const data = await db.get();

const hasNewCommits =
  (await githubService.getAllCommits(data.lastUpdate)).length > 0;

if (!hasNewCommits) {
  console.log("No new commits found!");

  Deno.exit(0);
}

const entries = Object.values(await githubService.getFile() as DenoXEntryMap);

const newEntries = entries.filter((e) =>
  data.entries.filter((ee) => ee.owner === e.owner && ee.repo === e.repo)
    .length === 0
);

console.log(`Found ${newEntries.length} new entries!`);

for (const entry of newEntries) {
  const { owner, repo, desc } = entry;

  const tweetTitle = `${owner} added ${repo} to #denojs X`;

  console.log(`Tweeting: ${tweetTitle}`);

  const response = await ifttt.trigger(
    "tweet",
    `${tweetTitle}\n${desc}\nYou can visit it on https://deno.land/x/${repo}\nhttps://github.com/${owner}/${repo}`,
  );

  console.log(response);

  await new Promise((r) => setTimeout(() => r(), 1000));
}

data.entries = [...data.entries, ...newEntries];
data.lastUpdate = currentISODate();

await db.set(data);
