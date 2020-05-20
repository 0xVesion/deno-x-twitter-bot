export abstract class API {
  private readonly baseUrl: string;
  private readonly authorization: string;

  public constructor(baseUrl: string, authorization: string) {
    this.baseUrl = baseUrl;
    this.authorization = authorization;
  }

  protected async fetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: this.authorization,
        ...(init?.headers || {}),
      },
    });

    if (response.status > 299) throw Error(`HTTP Error: ${response.status}, ${JSON.stringify(await response.json())}`);

    return response;
  }
}
