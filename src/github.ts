import { Api } from "./api.ts";

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

export class GithubApi extends Api {
  private readonly version: number;

  public constructor(authorization: string, version: number = 3) {
    super(
      "https://api.github.com",
      authorization ? `token ${authorization}` : "",
    );

    this.version = version;
  }

  protected fetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    return super.fetch(path, {
      headers: {
        Accept: `application/vnd.github.v${this.version}+json`,
        ...(init?.headers || {}),
      },
    });
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

  public async getFileContent(
    user: string,
    repo: string,
    path: string,
    branch: string = "master",
  ): Promise<string> {
    if (path.startsWith("/")) path = path.substring(1);

    return (await fetch(
      `https://raw.githubusercontent.com/${user}/${repo}/${branch}/${path}`,
    ))
      .json();
  }
}

export interface Commit {
  author: string;
  authorAvatarUrl: string;
  message: string;
  sha: string;
}

export class GithubService {
  private readonly github: GithubApi;
  private readonly user: string;
  private readonly repo: string;
  private readonly path: string;

  public constructor(
    github: GithubApi,
    user: string,
    repo: string,
    path: string,
  ) {
    this.github = github;
    this.user = user;
    this.repo = repo;
    this.path = path;
  }

  public async getAllCommits(since: string): Promise<Commit[]> {
    return (await this.github.getAllCommits(
      this.user,
      this.repo,
      this.path,
      since,
    )).map((c) =>
      ({
        author: c.author.login,
        authorAvatarUrl: c.author.avatar_url,
        message: c.commit.message,
        sha: c.sha,
        url: c.url,
      }) as Commit
    );
  }

  public async getFile(): Promise<any> {
    return this.github.getFileContent(this.user, this.repo, this.path);
  }
}
