import { exists, currentISODate } from "./util.ts";

export abstract class Database<T> {
  public readonly path: string;

  public constructor(path: string) {
    this.path = path;
  }

  abstract createDefault(): T;

  public async get(): Promise<T> {
    if (!await exists(this.path)) return this.createDefault();

    return JSON.parse(Deno.readTextFileSync(this.path)) as T;
  }

  public async set(entity: T): Promise<void> {
    Deno.writeTextFileSync(this.path, JSON.stringify(entity));
  }
}

export interface DenoXEntryMap {
  [e: string]: DenoXEntry;
}

export interface DenoXEntry {
  name?: string;
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
    super("data/.data.json");
  }

  public createDefault(): BotData {
    return { entries: [], lastUpdate: currentISODate() };
  }
}
