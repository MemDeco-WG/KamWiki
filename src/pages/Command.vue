<template>
    <div class="content">
        <div class="page-card">
            <div class="page-heading">
                <div>
                    <h1 data-testid="command-name">
                        {{ localizedCommand?.name || commandName }}
                    </h1>
                    <div class="kv muted stack-xs">
                        {{ localizedCommand?.summary || command?.summary }}
                    </div>

                    <div class="command-meta">
                        <div class="kv">{{ t("app.usage") }}</div>
                        <div class="kam-cli" data-testid="command-usage">
                            <span>{{
                                command?.usage || `kam ${commandName}`
                            }}</span>
                        </div>
                    </div>
                </div>

                <div class="toolbar-actions">
                    <button class="btn" @click="goBack">
                        {{ t("app.back") }}
                    </button>
                    <button
                        class="btn btn-primary"
                        @click="copyUsage"
                        :disabled="isCopying"
                    >
                        {{
                            copiedKey === commandName
                                ? t("app.copied")
                                : t("app.copy")
                        }}
                    </button>
                </div>
            </div>

            <div class="content section">
                <p v-if="!command" class="muted">
                    <strong>{{
                        t("app.commandNotFoundWithName", { name: commandName })
                    }}</strong>
                    <br />
                    {{ t("app.commandNotFoundDetail") }}
                    <router-link to="/">{{ t("app.commandList") }}</router-link
                    >.
                </p>

                <div v-else class="stack-md">
                    <section
                        v-if="localizedCommand?.description"
                        class="card"
                    >
                        <div class="kv stack-xs">
                            {{ t("app.description") }}
                        </div>
                        <div
                            class="content"
                            data-testid="command-description"
                            v-html="localizedCommand.description"
                        ></div>
                    </section>

                    <section v-if="localizedCommand?.flags?.length">
                        <h3>{{ t("app.flags") }}</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th class="flag-column">
                                        {{ t("app.flag") }}
                                    </th>
                                    <th>{{ t("app.description") }}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr
                                    v-for="flag in localizedCommand.flags"
                                    :key="flag.flag"
                                >
                                    <td>
                                        <code>{{ flag.flag }}</code>
                                    </td>
                                    <td>{{ flag.description }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </section>

                    <section v-if="command.examples?.length">
                        <h3>{{ t("app.examples") }}</h3>
                        <div class="example-list">
                            <pre
                                class="code"
                                v-for="example in command.examples"
                                :key="example"
                                >{{ example }}</pre
                            >
                        </div>
                    </section>

                    <section>
                        <h3>{{ t("app.globalOptions") }}</h3>
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
                    </section>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getCommandByName } from "@/data/kam";
import { useClipboardFeedback } from "@/composables/useClipboard";
import {
    localizeCommand,
    useLocalizedCommands,
} from "@/composables/useLocalizedCommands";
import type { KamCommand } from "@/data/kam";

const props = defineProps<{
    commandName?: string;
}>();

const route = useRoute();
const router = useRouter();
const i18n = useI18n();
const { t } = i18n;
const { copiedKey, isCopying, copyText } = useClipboardFeedback();

const commandName = computed(() =>
    props.commandName ? props.commandName : String(route.params?.name ?? ""),
);

const command = computed<KamCommand | undefined>(() => {
    if (!commandName.value) return undefined;
    return getCommandByName(commandName.value);
});

const localizedCommand = computed(() => {
    if (!command.value) return undefined;
    return localizeCommand(command.value, i18n);
});

const commandList = computed(() =>
    localizedCommand.value ? [localizedCommand.value] : [],
);
const { localizedGlobalFlags } = useLocalizedCommands(commandList, i18n);

function copyUsage() {
    copyText(command.value?.usage ?? `kam ${commandName.value}`, commandName.value);
}

function goBack() {
    if (window.history.length > 1) {
        router.back();
    } else {
        router.replace("/");
    }
}

watch(
    [command, () => t("app.brand"), () => t("app.brandSuffix")],
    ([cmd]) => {
        const base = `${t("app.brand")} - ${t("app.brandSuffix")}`;
        document.title = cmd
            ? `${cmd.name} | ${base}`
            : `${commandName.value} | ${base}`;
    },
    { immediate: true },
);
</script>

<style scoped>
/* Page-specific hook kept for SFC style transform tests; layout lives in main.css. */
</style>
