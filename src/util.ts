export async function exists(path: string): Promise<boolean> {
  try {
    await Deno.stat(path);

    return true;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) return false;

    throw error;
  }
}

export function currentISODate(millis: number = Date.now()): string {
  return new Date(millis).toISOString().split(".")[0] + "Z";
}