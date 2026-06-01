import cliData from "./generated-cli.json";

export type KamFlag = {
  flag: string;
  description?: string;
};

export type KamLocalizedCommand = {
  summary?: string;
  description?: string;
  flags?: KamFlag[];
};

export type KamCommand = {
  name: string;
  summary: string;
  description?: string;
  usage?: string;
  flags?: KamFlag[];
  examples?: string[];
  aliases?: string[];
  localized?: Record<string, KamLocalizedCommand>;
};

type GeneratedCliData = {
  globalFlags: KamFlag[];
  commands: KamCommand[];
};

const generated = cliData as GeneratedCliData;

export const KAM_GLOBAL_FLAGS: KamFlag[] = generated.globalFlags;
export const KAM_COMMANDS: KamCommand[] = generated.commands;

export function getAllCommands(): KamCommand[] {
  return [...KAM_COMMANDS];
}

export function getCommandByName(name: string): KamCommand | undefined {
  const key = (name || "").trim().toLowerCase();
  return KAM_COMMANDS.find((command) => command.name.toLowerCase() === key);
}

export function searchCommands(query: string): KamCommand[] {
  const q = (query || "").trim().toLowerCase();
  if (!q) return getAllCommands();
  return KAM_COMMANDS.filter((command) => {
    return (
      command.name.toLowerCase().includes(q) ||
      command.summary.toLowerCase().includes(q) ||
      (command.description || "").toLowerCase().includes(q) ||
      (command.aliases || []).some((alias) => alias.toLowerCase().includes(q))
    );
  });
}

export function getCommandNames(): string[] {
  return KAM_COMMANDS.map((command) => command.name);
}

export default KAM_COMMANDS;
