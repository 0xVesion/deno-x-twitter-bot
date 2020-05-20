import { GithubAPI, GithubService } from "./github.ts";
import { BotDatabase, DenoXEntryMap, DenoXEntry } from "./db.ts";
import { currentISODate } from "./util.ts";

const db = new BotDatabase();
const githubAPI = new GithubAPI();
const githubService = new GithubService(
  githubAPI,
  "denoland",
  "deno_website2",
  "/database.json",
);

const data = await db.get();
await db.set(data);

const hasNewCommits =
  (await githubService.getAllCommits(data.lastUpdate)).length > 0;

if (!hasNewCommits) {
  Deno.exit(0);
} else {
  const entries = Object.values(await githubService.getFile() as DenoXEntryMap);

  const newEntries = entries.filter((e) =>
    data.entries.filter((ee) => ee.owner === e.owner && ee.repo === e.repo)
      .length === 0
  );
  console.log(newEntries);

  data.entries = [...data.entries, ...newEntries];
  data.lastUpdate = currentISODate();

  await db.set(data);
}