import { exists } from "./util.ts";

abstract class Database<T> {
  public readonly path: string;

  public constructor(path: string) {
    this.path = path;
  }

  abstract createDefault(): T;

  public async get(): Promise<T> {
    if (!await exists(this.path)) return this.createDefault();

    return JSON.parse(await Deno.readTextFile(this.path)) as T;
  }

  public async set(entity: T): Promise<void> {    
    const entityString = new TextEncoder().encode(JSON.stringify(entity));
    
    await Deno.writeFile(this.path, entityString);
  }
}
