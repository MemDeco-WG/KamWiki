import { computed, type ComputedRef } from "vue";
import { KAM_GLOBAL_FLAGS, type KamCommand, type KamFlag } from "@/data/kam";

type Translator = {
  t: (key: string) => unknown;
  te: (key: string) => boolean;
};

function flagDescriptionKey(flag: KamFlag) {
  if (flag.flag.includes("--help") || flag.flag.includes("-h")) {
    return "globalFlags.help";
  }
  if (flag.flag.includes("--version") || flag.flag.includes("-V")) {
    return "globalFlags.version";
  }
  return undefined;
}

function flagLookupKey(flag: KamFlag) {
  const longMatch = flag.flag.match(/--([a-zA-Z0-9\-_]+)/);
  if (longMatch?.[1]) return longMatch[1];

  return (flag.flag.split(",")[0] ?? "")
    .replace(/^-+/, "")
    .replace(/^i$/, "interactive");
}

export function localizeCommand(command: KamCommand, translator: Translator) {
  const baseKey = `commands.${command.name}`;
  const summaryKey = `${baseKey}.summary`;
  const descriptionKey = `${baseKey}.description`;
  const flagDescriptionsKey = `${baseKey}.flagDescriptions`;

  const localized: KamCommand = {
    ...command,
    summary: translator.te(summaryKey)
      ? String(translator.t(summaryKey))
      : command.summary,
    description: translator.te(descriptionKey)
      ? String(translator.t(descriptionKey))
      : command.description,
  };

  if (command.flags?.length && translator.te(flagDescriptionsKey)) {
    const flagDescriptions = translator.t(flagDescriptionsKey) as Record<
      string,
      string
    >;
    localized.flags = command.flags.map((flag) => ({
      ...flag,
      description:
        flagDescriptions[flagLookupKey(flag)] ?? flag.description ?? "",
    }));
  }

  return localized;
}

export function useLocalizedCommands(
  commands: ComputedRef<KamCommand[]>,
  translator: Translator,
) {
  const localizedCommands = computed(() =>
    commands.value.map((command) => localizeCommand(command, translator)),
  );

  const localizedGlobalFlags = computed(() =>
    KAM_GLOBAL_FLAGS.map((flag) => {
      const key = flagDescriptionKey(flag);
      return {
        ...flag,
        description: key ? String(translator.t(key)) : flag.description,
      };
    }),
  );

  return {
    localizedCommands,
    localizedGlobalFlags,
  };
}
