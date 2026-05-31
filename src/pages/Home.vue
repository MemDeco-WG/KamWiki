<template>
    <section class="home">
        <header class="page-card">
            <div class="page-heading">
                <div>
                    <h1>{{ t("app.brand") }} — {{ t("app.subtitle") }}</h1>
                    <p class="muted">
                        {{ t("app.homeDescription") }}
                    </p>
                </div>
                <div class="kv align-right">
                    <div>
                        <strong>{{ t("app.offline") }}</strong>
                    </div>
                    <div class="muted">
                        {{ t("app.offlineDesc") }}
                    </div>
                </div>
            </div>

            <div class="toolbar">
                <div class="muted">
                    {{ t("app.usage") }}:
                    <code>kam &lt;COMMAND&gt; [OPTIONS]</code>
                </div>

                <div class="toolbar-actions">
                    <button class="btn" @click="copyUsage">
                        {{
                            copiedKey === "all" ? t("app.copied") : t("app.copy")
                        }}
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

            <div class="stack-sm">
                <div class="kv">{{ t("app.globalOptions") }}</div>
                <div class="chip-row">
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

        <section class="section">
            <div class="section-heading">
                <h2>{{ t("app.commands") }}</h2>

                <div class="search-row">
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

            <div class="stack-md">
                <div class="command-list" data-testid="command-list">
                    <article
                        v-for="cmd in localizedCommands"
                        :key="cmd.name"
                        class="card command-card"
                    >
                        <div class="command-card-main">
                            <router-link
                                :to="`/command/${cmd.name}`"
                                class="command-item"
                                :aria-label="t('app.open') + ' ' + cmd.name"
                            >
                                <div class="command-title-row">
                                    <strong>{{ cmd.name }}</strong>
                                    <div class="muted command-summary">
                                        {{ cmd.summary }}
                                    </div>
                                </div>
                            </router-link>

                            <div class="stack-sm">
                                <div class="kv">{{ t("app.usage") }}</div>
                                <pre class="code">{{ cmd.usage }}</pre>
                            </div>

                            <div
                                v-if="
                                    (toggleAllExpanded || expanded[cmd.name]) &&
                                    cmd.description
                                "
                                class="stack-sm"
                            >
                                <div class="kv">
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
                                class="stack-sm"
                            >
                                <div class="kv">{{ t("app.examples") }}</div>
                                <div class="example-list">
                                    <pre
                                        v-for="ex in cmd.examples"
                                        :key="ex"
                                        class="code"
                                        >{{ ex }}</pre
                                    >
                                </div>
                            </div>
                        </div>

                        <div class="command-card-actions">
                            <router-link
                                :to="`/command/${cmd.name}`"
                                class="btn btn-primary"
                                >{{ t("app.open") }}</router-link
                            >
                            <button class="btn" @click="copyCommandUsage(cmd)">
                                {{
                                    copiedKey === cmd.name
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
import { computed, reactive, ref, watch, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getAllCommands, searchCommands } from "@/data/kam";
import { useI18n } from "vue-i18n";
import { useClipboardFeedback } from "@/composables/useClipboard";
import { useLocalizedCommands } from "@/composables/useLocalizedCommands";
import type { KamCommand } from "@/data/kam";

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { t } = i18n;
const { copiedKey, copyText } = useClipboardFeedback();

const localSearch = ref("");

onMounted(() => {
    localSearch.value = (route.query.q as string) ?? "";
});

watch(localSearch, (value) => {
    router.replace({ query: value ? { q: value } : {} });
});

watch(
    () => route.query.q,
    (query) => {
        localSearch.value = (query as string) ?? "";
    },
);

const allCommands = getAllCommands();
const filteredCommands = computed(() =>
    localSearch.value ? searchCommands(localSearch.value) : allCommands,
);
const { localizedCommands, localizedGlobalFlags } = useLocalizedCommands(
    filteredCommands,
    i18n,
);

const toggleAllExpanded = ref(false);
const expanded = reactive<Record<string, boolean>>({});

function toggleExpand(cmd: KamCommand) {
    expanded[cmd.name] = !expanded[cmd.name];
}

function applySearchEnter() {
    const first = localizedCommands.value[0] || filteredCommands.value[0];
    if (first) {
        router.push({ name: "Command", params: { name: first.name } });
    }
}

function clearSearch() {
    localSearch.value = "";
    router.replace({ query: {} });
}

function copyUsage() {
    const commandNames = allCommands.map((command) => command.name).join(", ");
    copyText(`kam <COMMAND> - ${commandNames}`, "all");
}

function copyCommandUsage(cmd: KamCommand) {
    copyText(cmd.usage ?? `kam ${cmd.name}`, cmd.name);
}
</script>

<style scoped>
/* Page-specific hook kept for SFC style transform tests; layout lives in main.css. */
</style>
