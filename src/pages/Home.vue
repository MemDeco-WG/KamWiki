<template>
    <section class="home">
        <header class="page-card">
            <div
                style="
                    display: flex;
                    justify-content: space-between;
                    gap: 16px;
                    align-items: center;
                "
            >
                <div>
                    <h1>{{ t("app.brand") }} — {{ t("app.subtitle") }}</h1>
                    <p class="muted">
                        {{ t("app.homeDescription") }}
                    </p>
                </div>
                <div class="kv" style="text-align: right">
                    <div>
                        <strong>{{ t("app.offline") }}</strong>
                    </div>
                    <div class="muted">
                        {{ t("app.offlineDesc") }}
                    </div>
                </div>
            </div>

            <div
                style="
                    margin-top: 14px;
                    display: flex;
                    gap: 12px;
                    align-items: center;
                    flex-wrap: wrap;
                "
            >
                <div class="muted">
                    {{ t("app.usage") }}:
                    <code>kam &lt;COMMAND&gt; [OPTIONS]</code>
                </div>

                <div style="margin-left: auto; display: flex; gap: 8px">
                    <button class="btn" @click="copyUsage">
                        {{ t("app.copy") }}
                    </button>
                    <button
                        class="btn"
                        @click="toggleAllExpanded = !toggleAllExpanded"
                    >
                        {{
                            toggleAllExpanded
                                ? t("app.collapse")
                                : t("app.expand")
                        }}
                    </button>
                </div>
            </div>

            <div style="margin-top: 10px">
                <div class="kv">{{ t("app.globalOptions") }}</div>
                <div
                    style="
                        display: flex;
                        gap: 8px;
                        margin-top: 6px;
                        flex-wrap: wrap;
                    "
                >
                    <span
                        v-for="flag in localizedGlobalFlags"
                        :key="flag.flag"
                        class="chip"
                        :title="flag.description"
                    >
                        {{ flag.flag }}
                    </span>
                </div>
            </div>
        </header>

        <section style="margin-top: 16px">
            <div
                style="
                    display: flex;
                    gap: 12px;
                    justify-content: space-between;
                    align-items: center;
                "
            >
                <h2 style="margin: 0">{{ t("app.commands") }}</h2>

                <div style="display: flex; gap: 8px; align-items: center">
                    <input
                        type="search"
                        class="search-input"
                        :placeholder="t('app.searchPlaceholder')"
                        v-model="localSearch"
                        @keydown.enter.prevent="applySearchEnter"
                        :aria-label="t('app.searchPlaceholder')"
                    />
                    <button class="btn" @click="clearSearch">
                        {{ t("app.clear") }}
                    </button>
                </div>
            </div>

            <div style="margin-top: 10px">
                <div class="command-list">
                    <article
                        v-for="cmd in localizedCommands"
                        :key="cmd.name"
                        class="card"
                        style="
                            display: flex;
                            gap: 12px;
                            align-items: flex-start;
                            justify-content: space-between;
                        "
                    >
                        <div style="flex: 1">
                            <router-link
                                :to="`/command/${cmd.name}`"
                                class="command-item"
                                :aria-label="t('app.open') + ' ' + cmd.name"
                            >
                                <div
                                    style="
                                        display: flex;
                                        gap: 8px;
                                        align-items: center;
                                    "
                                >
                                    <strong style="font-size: 1.02rem">{{
                                        cmd.name
                                    }}</strong>
                                    <div
                                        class="muted"
                                        style="font-size: 0.9rem"
                                    >
                                        {{ cmd.summary }}
                                    </div>
                                </div>
                            </router-link>

                            <div style="margin-top: 8px">
                                <div class="kv">{{ t("app.usage") }}</div>
                                <pre class="code">{{ cmd.usage }}</pre>
                            </div>

                            <div
                                v-if="
                                    (toggleAllExpanded || expanded[cmd.name]) &&
                                    cmd.description
                                "
                                style="margin-top: 8px"
                            >
                                <div class="kv" style="margin-bottom: 6px">
                                    {{ t("app.description") }}
                                </div>
                                <div
                                    class="content"
                                    v-html="cmd.description"
                                ></div>
                            </div>

                            <div
                                v-if="
                                    (toggleAllExpanded || expanded[cmd.name]) &&
                                    cmd.examples?.length
                                "
                                style="margin-top: 8px"
                            >
                                <div class="kv">{{ t("app.examples") }}</div>
                                <div style="margin-top: 6px">
                                    <pre
                                        v-for="ex in cmd.examples"
                                        :key="ex"
                                        class="code"
                                        >{{ ex }}</pre
                                    >
                                </div>
                            </div>
                        </div>

                        <div
                            style="
                                display: flex;
                                flex-direction: column;
                                gap: 8px;
                                align-items: flex-end;
                                justify-content: flex-start;
                            "
                        >
                            <router-link
                                :to="`/command/${cmd.name}`"
                                class="btn btn-primary"
                                >{{ t("app.open") }}</router-link
                            >
                            <button class="btn" @click="copyCommandUsage(cmd)">
                                {{
                                    copied?.cmd === cmd.name
                                        ? t("app.copied")
                                        : t("app.copy")
                                }}
                            </button>
                            <button class="btn" @click="toggleExpand(cmd)">
                                {{
                                    expanded[cmd.name] || toggleAllExpanded
                                        ? t("app.collapse")
                                        : t("app.expand")
                                }}
                            </button>
                        </div>
                    </article>

                    <div v-if="!filteredCommands.length" class="card muted">
                        {{ t("app.noResultsMatch") }}
                    </div>
                </div>
            </div>
        </section>
    </section>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAllCommands, searchCommands, KAM_GLOBAL_FLAGS } from "@/data/kam";
import { useI18n } from "vue-i18n";
import type { KamCommand } from "@/data/kam";

const route = useRoute();
const router = useRouter();
const { t, te } = useI18n();

// Localized global flags
const localizedGlobalFlags = computed(() =>
    KAM_GLOBAL_FLAGS.map((flag) => {
        let description = flag.description || "";
        if (flag.flag.includes("--help") || flag.flag.includes("-h")) {
            description = t("globalFlags.help");
        } else if (flag.flag.includes("--version") || flag.flag.includes("-V")) {
            description = t("globalFlags.version");
        }
        return { ...flag, description };
    }),
);

// Local, synced search value. We keep it in the URL as `q` so a shared link can reproduce the search.
const localSearch = ref<string>("");
// Set from route
onMounted(() => {
    localSearch.value = (route.query.q as string) ?? "";
});

// Keep route query in sync when typing
watch(
    localSearch,
    (val) => {
        // Replace query param to avoid navigation history clogging
        const query = val ? { q: val } : {};
        router.replace({ query });
    },
    { immediate: false },
);

watch(
    () => route.query.q,
    (q) => {
        // Keep localSearch in sync when header search or any other component sets the query
        localSearch.value = (q as string) ?? "";
    },
);

// Commands and search
const allCommands = ref<KamCommand[]>(getAllCommands());
const filteredCommands = computed(() =>
    localSearch.value ? searchCommands(localSearch.value) : getAllCommands(),
);

// Create a localized version of the filtered commands (summary/description override)
const localizedCommands = computed(() =>
    filteredCommands.value.map((cmd) => {
        const summaryKey = `commands.${cmd.name}.summary`;
        const descKey = `commands.${cmd.name}.description`;
        const localizedSummary = te(summaryKey)
            ? (t(summaryKey) as string)
            : cmd.summary;
        const localizedDescription = te(descKey)
            ? (t(descKey) as string)
            : cmd.description;
        return {
            ...cmd,
            summary: localizedSummary,
            description: localizedDescription,
        } as KamCommand;
    }),
);

// UI state
const toggleAllExpanded = ref(false);
const expanded = reactive<Record<string, boolean>>({});
const copied = ref<{ cmd?: string | null; when?: number } | null>(null);

function toggleExpand(cmd: KamCommand) {
    expanded[cmd.name] = !expanded[cmd.name];
}

function applySearchEnter() {
    // Jump to first search result if present
    const first = localizedCommands.value[0] || filteredCommands.value[0];
    if (first) {
        router.push({ name: "Command", params: { name: first.name } });
    }
}

function clearSearch() {
    localSearch.value = "";
    router.replace({ query: {} });
}

// Clipboard helpers
async function copyToClipboard(text: string) {
    if (navigator?.clipboard && navigator.clipboard.writeText) {
        try {
            await navigator.clipboard.writeText(text);
            return true;
        } catch (err) {
            // fallback
        }
    }
    // fallback method
    try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "true");
        ta.style.position = "absolute";
        ta.style.left = "-9999px";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
        return true;
    } catch (e) {
        return false;
    }
}

async function copyUsage() {
    const cmdLine = `kam <COMMAND> — ${allCommands.value.map((c) => c.name).join(", ")}`;
    const ok = await copyToClipboard(cmdLine);
    if (ok) {
        copied.value = { cmd: "all", when: Date.now() };
        setTimeout(() => (copied.value = null), 1500);
    }
}

async function copyCommandUsage(cmd: KamCommand) {
    const u = cmd.usage ?? `kam ${cmd.name}`;
    const ok = await copyToClipboard(u);
    if (ok) {
        copied.value = { cmd: cmd.name, when: Date.now() };
        setTimeout(() => (copied.value = null), 1500);
    }
}
</script>

<style scoped>
.home {
    display: block;
}

/* Small adaptations for the page layout */
.search-input {
    padding: 8px 10px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--card);
    color: var(--text);
}

.card {
    background: var(--card);
    padding: 1.25rem;
    border-radius: var(--radius);
    margin-bottom: 1rem;
    border: 1.5px solid var(--border);
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
}
.card:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
    border-color: var(--accent);
}

/* FYI: we rely on the global .command-item, .command-list, .kv, .muted classes */
.command-list article {
    padding: 10px;
    align-items: flex-start;
}

.code {
    margin: 0;
    white-space: pre-wrap;
    font-family:
        ui-monospace, SFMono-Regular, Menlo, Monaco, "Roboto Mono", monospace;
    background: var(--code-bg);
    padding: 0.875rem 1rem;
    border-radius: var(--radius-sm);
    border: 1.5px solid var(--border);
    overflow: auto;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
}
.code:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
}

.kv {
    color: var(--muted);
    font-size: 0.9rem;
}

.muted {
    color: var(--muted);
}

.chip {
    display: inline-block;
    padding: 0.35rem 0.75rem;
    border-radius: 999px;
    background: var(--surface);
    color: var(--muted);
    border: 1.5px solid var(--border);
    font-weight: 600;
    font-size: 0.85rem;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-fast);
}
.chip:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
    border-color: var(--accent);
    color: var(--accent);
}
</style>
