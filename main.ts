import { GithubAPI } from "./github.ts";

const github = new GithubAPI();

const commits = await github.getAllCommits(
  "denoland",
  "deno_website2",
  "/database.json",
  new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString().split('.')[0] + 'Z',
);

console.log(commits.map((c) => ({
    author: c.author.login,
    authorAvatarUrl: c.author.avatar_url,
    message: c.commit.message,
    sha: c.sha,
    url: c.url,
})));
