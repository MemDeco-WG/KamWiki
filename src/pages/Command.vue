<template>
    <div class="content">
        <div class="page-card">
            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    gap: 12px;
                "
            >
                <div>
                    <h1 style="margin: 0">
                        {{ command?.name || commandName }}
                    </h1>
                    <div class="kv muted" style="margin-top: 6px">
                        {{ localizedCommand?.summary || command?.summary }}
                    </div>

                    <div class="command-meta" style="margin-top: 10px">
                        <div class="kv">{{ t("app.usage") }}</div>
                        <div class="kam-cli">
                            <span>{{
                                command?.usage || `kam ${commandName}`
                            }}</span>
                        </div>
                    </div>
                </div>

                <div style="display: flex; gap: 8px; align-items: center">
                    <button class="btn" @click="goBack">
                        {{ t("app.back") }}
                    </button>
                    <button
                        class="btn btn-primary"
                        @click="copyUsage"
                        :disabled="isCopying"
                    >
                        {{ copied ? t("app.copied") : t("app.copy") }}
                    </button>
                </div>
            </div>

            <div class="content" style="margin-top: 14px">
                <p v-if="!command" class="muted">
                    <strong>{{
                        t("app.commandNotFoundWithName", { name: commandName })
                    }}</strong>
                    <br />
                    {{ t("app.commandNotFoundDetail") }}
                    <router-link to="/">{{ t("app.commandList") }}</router-link
                    >.
                </p>

                <div v-else>
                    <div
                        v-if="command.description"
                        class="card"
                        style="margin-bottom: 12px"
                    >
                        <div class="kv" style="margin-bottom: 6px">
                            {{ t("app.description") }}
                        </div>
                        <div
                            class="content"
                            v-html="
                                localizedCommand?.description ||
                                command?.description
                            "
                        ></div>
                    </div>

                    <div
                        v-if="command.flags && command.flags.length"
                        style="margin-bottom: 12px"
                    >
                        <h3 style="margin-bottom: 6px">
                            {{ t("app.flags") }}
                        </h3>
                        <table>
                            <thead>
                                <tr>
                                    <th style="width: 32%">
                                        {{ t("app.flag") }}
                                    </th>
                                    <th>{{ t("app.description") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="f in localizedCommand?.flags ||
                                    command.flags"
                                    :key="f.flag"
                                >
                                    <td>
                                        <code>{{ f.flag }}</code>
                                    </td>
                                    <td>{{ f.description }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div
                        v-if="command.examples && command.examples.length"
                        style="margin-bottom: 12px"
                    >
                        <h3 style="margin-bottom: 6px">
                            {{ t("app.examples") }}
                        </h3>
                        <div
                            style="
                                display: flex;
                                flex-direction: column;
                                gap: 8px;
                            "
                        >
                            <pre
                                class="code"
                                v-for="ex in command.examples"
                                :key="ex"
                                >{{ ex }}</pre
                            >
                        </div>
                    </div>

                    <div style="margin-top: 6px">
                        <h3 style="margin-bottom: 6px">
                            {{ t("app.globalOptions") }}
                        </h3>
                        <div style="display: flex; gap: 8px; flex-wrap: wrap">
                            <span
                                v-for="g in localizedGlobalFlags"
                                :key="g.flag"
                                class="chip"
                                :title="g.description"
                            >
                                {{ g.flag }}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getCommandByName, KAM_GLOBAL_FLAGS } from "@/data/kam";
import type { KamCommand } from "@/data/kam";

// Props: the router will pass `commandName` param as a prop via routes config
const props = defineProps<{
    commandName?: string;
}>();

const route = useRoute();
const router = useRouter();
const { t, te } = useI18n();

// Localized global flags
const localizedGlobalFlags = computed(() =>
    KAM_GLOBAL_FLAGS.map((flag) => {
        let description = flag.description || "";
        if (flag.flag.includes("--help") || flag.flag.includes("-h")) {
            description = t("globalFlags.help");
        } else if (
            flag.flag.includes("--version") ||
            flag.flag.includes("-V")
        ) {
            description = t("globalFlags.version");
        }
        return { ...flag, description };
    }),
);

// derive the commandName from prop or route (fallback)
const commandName = computed(() => {
    return props.commandName
        ? props.commandName
        : String(route.params?.name ?? "");
});

// load command from the data store
const command = computed<KamCommand | undefined>(() => {
    const n = commandName.value || "";
    if (!n) return undefined;
    return getCommandByName(n);
});

const localizedCommand = computed<KamCommand | undefined>(() => {
    const c = command.value;
    if (!c) return undefined;
    const baseKey = `commands.${c.name}`;
    const summaryKey = `${baseKey}.summary`;
    const descKey = `${baseKey}.description`;
    const flagsKey = `${baseKey}.flagDescriptions`;

    const result: any = { ...c };
    if (te(summaryKey)) result.summary = t(summaryKey) as string;
    if (te(descKey)) result.description = t(descKey) as string;

    // Localize flags if available
    if (c.flags && c.flags.length > 0 && te(flagsKey)) {
        const flagDescriptions = t(flagsKey) as Record<string, string>;
        result.flags = c.flags.map((flag) => {
            // Try to match flag by key (prefer long names like "--output" before short alias "-o")
            // Normalize to a string and guard the split index result
            const f = typeof flag?.flag === "string" ? flag.flag : "";
            let flagKey = "";
            // Prefer a long-form flag (e.g. --output) when available, otherwise fall back to the first alias
            const longMatch = String(f).match(/--([a-zA-Z0-9\-_]+)/);
            if (longMatch && longMatch[1]) {
                flagKey = longMatch[1];
            } else {
                const splitFirst = String(f).split(",")[0] ?? "";
                flagKey = splitFirst
                    .replace(/^-+/, "")
                    .replace(/^i$/, "interactive");
            }
            const localizedDesc =
                flagDescriptions[flagKey] ?? flag?.description ?? "";
            return { ...(flag || {}), description: localizedDesc };
        });
    }

    return result as KamCommand;
});

// UI state for copying
const copied = ref(false);
const isCopying = ref(false);

async function copyUsage() {
    const usage = command.value?.usage ?? `kam ${commandName.value}`;
    if (!usage) return;
    try {
        isCopying.value = true;
        if (navigator?.clipboard?.writeText) {
            await navigator.clipboard.writeText(usage);
        } else {
            // fallback for older browsers
            const ta = document.createElement("textarea");
            ta.value = usage;
            ta.style.position = "fixed";
            ta.style.left = "-9999px";
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
        }
        copied.value = true;
        setTimeout(() => (copied.value = false), 1500);
    } catch (err) {
        // ignore errors - clipboard sometimes fails in non-secure contexts
        // eslint-disable-next-line no-console
        console.warn("Copy failed", err);
    } finally {
        isCopying.value = false;
    }
}

function goBack() {
    // Prefer router.back() but fallback to home
    try {
        router.back();
        // On some cases router.back doesn't change route; ensure home fallback
        setTimeout(() => {
            if (route.name === "Command") router.replace("/");
        }, 300);
    } catch {
        router.replace("/");
    }
}

// Keep document title in sync with the current command and locale
watch([command, () => t("app.brand"), () => t("app.brandSuffix")], ([cmd]) => {
    const base = `${t("app.brand")} — ${t("app.brandSuffix")}`;
    if (!cmd) {
        document.title = `${commandName.value} | ${base}`;
    } else {
        document.title = `${cmd.name} | ${base}`;
    }
});

onMounted(() => {
    // Set initial title
    const base = `${t("app.brand")} — ${t("app.brandSuffix")}`;
    document.title = command.value
        ? `${command.value.name} | ${base}`
        : `${commandName.value} | ${base}`;
});
</script>

<style scoped>
.kv {
    color: var(--muted);
    font-size: 0.95rem;
}
.kam-cli {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: 8px;
    background: var(--code-bg);
    font-family: var(--font-mono);
    font-size: 0.95rem;
    border: 1px solid var(--border);
    margin-top: 6px;
    white-space: pre-wrap;
}
.card {
    background: var(--card);
    padding: 1.25rem;
    border-radius: var(--radius);
    border: 1.5px solid var(--border);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
}
.card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--accent);
}
.code {
    display: block;
    background: var(--code-bg);
    padding: 0.875rem 1rem;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--border);
    font-family: var(--font-mono);
    overflow: auto;
    margin: 0;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
}
.code:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
}
.command-meta {
    margin-top: 8px;
    display: flex;
    gap: 12px;
    align-items: center;
}
.chip {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: var(--surface);
    color: var(--muted);
    font-weight: 600;
    font-size: 0.85rem;
    border: 1.5px solid var(--border);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
}
.chip:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
    color: var(--accent);
}
.table {
    width: 100%;
    border-collapse: collapse;
}
table {
    box-shadow: var(--shadow-sm);
    border-radius: var(--radius-sm);
    overflow: hidden;
}
table th,
table td {
    border: 1px solid var(--border);
    padding: 0.75rem 1rem;
    text-align: left;
    transition: background-color var(--transition-fast);
}
table th {
    background: var(--surface);
    font-weight: 700;
    color: var(--accent);
    text-transform: uppercase;
    font-size: 0.85rem;
    letter-spacing: 0.5px;
}
table tr:hover {
    background: var(--surface);
}
table tr:hover td {
    background: var(--surface);
}
</style>
