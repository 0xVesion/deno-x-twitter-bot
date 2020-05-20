import { exists, currentISODate } from "./util.ts";

export abstract class Database<T> {
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

export interface DenoXEntryMap {
  [e: string]: DenoXEntry;
}

export interface DenoXEntry {
  type: DenoXEntryType;
  owner: string;
  repo: string;
  desc: string;
  path?: string;
  defaultVersion?: string;
}

export enum DenoXEntryType {
  Github = "github",
}

export interface BotData {
  entries: DenoXEntry[];
  lastUpdate: string; // iso string
}

export class BotDatabase extends Database<BotData> {
  constructor() {
    super('.data.json');
  }

  public createDefault(): BotData {
    return {entries: [], lastUpdate: currentISODate()};
  }
}