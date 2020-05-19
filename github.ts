import { API } from "./api.ts";

export interface GithubCommitResponse {
  sha: string;
  commit: GithubCommit;
  url: string;
  author: GithubCommitAuthor;
}

export interface GithubCommitAuthor {
  login: string;
  id: number;
  avatar_url: string;
  url: string;
}

export interface GithubCommit {
  message: string;
  url: string;
  comment_count: number;
}

export class GithubAPI extends API {
  private readonly version: number;

  public constructor(version: number = 3) {
    super("https://api.github.com");
    this.version = version;
  }

  protected fetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    if (!init) init = {};
    if (!init.headers) init.headers = {};

    init.headers = {
      ...init.headers,
      "Accept": `application/vnd.github.v${this.version}+json`,
    };

    return super.fetch(path, init);
  }

  public async getAllCommits(
    user: string,
    repo: string,
    path: string,
    since: string,
  ) {
    return await (await this.fetch(
      `/repos/${user}/${repo}/commits?since=${since}&path=${path}`,
    )).json() as GithubCommitResponse[];
  }
}
