import { parse, stringify } from "https://deno.land/std@0.200.0/yaml/mod.ts";
import { Config } from "./reminder_logic.ts";

export async function readConfig(): Promise<Config> {
  const content = await Deno.readTextFile("tasks.yml");
  return parse(content) as Config;
}

export async function writeConfig(config: Config): Promise<void> {
  const yamlContent = stringify(config);
  await Deno.writeTextFile("tasks.yml", yamlContent);
}
