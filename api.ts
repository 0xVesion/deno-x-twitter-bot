export abstract class API {
  private readonly baseUrl: string;

  public constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  protected async fetch(
    path: string,
    init?: RequestInit,
  ): Promise<Response> {
    const response = await fetch(`${this.baseUrl}${path}`, init);

    if (response.status > 299) throw Error(`HTTP Error: ${response.status}, ${JSON.stringify(await response.json())}`);

    return response;
  }
}
