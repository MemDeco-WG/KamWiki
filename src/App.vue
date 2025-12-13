<template>
    <div id="app">
        <!-- Header -->
        <header class="header" role="banner" :aria-label="t('app.headerLabel')">
            <div class="brand" role="heading" aria-level="1">
                <router-link
                    to="/"
                    @click="clearSearch"
                    class="brand"
                    :aria-label="t('app.home')"
                >
                    <span class="logo">KM</span>
                    <span
                        >{{ t("app.brand") }} — {{ t("app.brandSuffix") }}</span
                    >
                </router-link>
            </div>

            <div class="header-actions">
                <div
                    class="search"
                    role="search"
                    :aria-label="t('app.searchPlaceholder')"
                >
                    <input
                        type="search"
                        v-model="searchQuery"
                        :placeholder="t('app.searchPlaceholder')"
                        @keydown.enter.prevent="onSearchEnter"
                        :aria-label="t('app.searchPlaceholder')"
                    />
                </div>

                <select
                    v-model="locale"
                    :aria-label="t('app.language')"
                    class="lang-select"
                >
                    <option value="en">EN</option>
                    <option value="zh">中文</option>
                </select>

                <button
                    class="btn theme-toggle"
                    :title="themeToggleTitle"
                    :aria-pressed="isDark"
                    @click="toggleTheme"
                    :aria-label="themeToggleTitle"
                >
                    <span v-if="!isDark" class="theme-icon">🌙</span>
                    <span v-else class="theme-icon">☀️</span>
                </button>
            </div>
        </header>

        <!-- App Container -->
        <div class="container" role="main">
            <!-- Sidebar -->
            <aside class="sidebar" :aria-label="t('app.commandsNavigation')">
                <div class="card">
                    <div class="header" style="padding: 0; margin-bottom: 12px">
                        <div>
                            <strong>{{ t("app.commands") }}</strong>
                            <div class="kv muted">
                                {{ t("app.brand") }} — {{ t("app.subtitle") }}
                            </div>
                        </div>
                        <div class="muted" style="font-size: 0.85rem">
                            <small>{{ t("app.searchAndExplore") }}</small>
                        </div>
                    </div>

                    <!-- Sidebar Search -->
                    <div class="search">
                        <input
                            type="search"
                            v-model="searchQuery"
                            :placeholder="t('app.filterPlaceholder')"
                            @keydown.enter.prevent="onSearchEnter"
                            :aria-label="t('app.filterPlaceholder')"
                        />
                    </div>

                    <!-- Command list -->
                    <ul class="command-list" role="list">
                        <li v-for="cmd in filteredCommands" :key="cmd.name">
                            <router-link
                                :to="`/command/${cmd.name}`"
                                class="command-item"
                                :class="{
                                    active: selectedCommandName === cmd.name,
                                }"
                                @click="onSelectCommand(cmd.name)"
                                role="link"
                            >
                                <div
                                    style="
                                        display: flex;
                                        align-items: center;
                                        gap: 10px;
                                    "
                                >
                                    <div style="font-weight: 700">
                                        {{ cmd.name }}
                                    </div>
                                    <div
                                        class="kv muted"
                                        style="font-size: 0.8rem"
                                    >
                                        {{ cmd.summary }}
                                    </div>
                                </div>
                            </router-link>
                        </li>

                        <li
                            v-if="!filteredCommands.length"
                            class="muted"
                            style="padding: 8px 12px"
                        >
                            {{ t("app.noResults") }}
                        </li>
                    </ul>

                    <div
                        style="
                            margin-top: 12px;
                            display: flex;
                            gap: 8px;
                            align-items: center;
                        "
                    >
                        <router-link to="/" class="btn">{{
                            t("app.home")
                        }}</router-link>
                        <button class="btn" @click="copyAllCommands">
                            {{ t("app.copy") }} 'kam' {{ t("app.usage") }}
                        </button>
                    </div>
                </div>
            </aside>

            <!-- Main content -->
            <main class="main">
                <div class="page-card card">
                    <router-view />
                </div>
            </main>
        </div>

        <!-- Footer -->
        <footer class="footer" role="contentinfo">
            <div>
                {{ t("app.footer") }}
            </div>
        </footer>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useI18n } from "vue-i18n";
import { getAllCommands, searchCommands } from "@/data/kam";
import type { KamCommand } from "@/data/kam";

// Router for navigation on search enter
const router = useRouter();
const route = useRoute();
const { t, locale } = useI18n();

// Search query state, shared between header & sidebar
const searchQuery = ref("");

// Get initial commands
const allCommands = ref<KamCommand[]>(getAllCommands());

// Filtered view of commands based on search
const filteredCommands = computed(() => {
    return searchCommands(searchQuery.value);
});

// Selected command name (based on route param)
const selectedCommandName = computed(() => {
    const name = route.params?.name as string | undefined;
    return (name || "").toString();
});

// Theme state: read from storage or system preference
const isDark = ref(false);
const themeToggleTitle = computed(() =>
    isDark.value ? t("app.switchToLight") : t("app.switchToDark"),
);

// Copies text to clipboard
async function copyText(text: string) {
    try {
        if (!navigator?.clipboard) {
            // No clipboard API — try legacy fallback
            const ta = document.createElement("textarea");
            ta.value = text;
            document.body.appendChild(ta);
            ta.select();
            document.execCommand("copy");
            document.body.removeChild(ta);
            return true;
        }
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to copy", err);
        return false;
    }
}

// Copy helper: copy 'kam' base usage
async function copyAllCommands() {
    const text = `kam — CLI (commands: ${allCommands.value.map((c) => c.name).join(", ")})`;
    const ok = await copyText(text);
    if (ok) {
        // Optionally give feedback via UI - a snack or similar
        // eslint-disable-next-line no-console
        console.debug("Copied default kam usage to clipboard");
    }
}

function clearSearch() {
    // Clear the search input from the shared app state
    searchQuery.value = "";
}

// When the user selects a command in the sidebar
function onSelectCommand(name: string) {
    // We'll rely on router-link navigation, but ensure search cleared on selection
    searchQuery.value = "";
}

// When search is pressed with Enter: go to the first matched command if exists
function onSearchEnter() {
    const items = filteredCommands.value;
    const first = items[0];
    if (first) {
        router.push({ name: "Command", params: { name: first.name } });
    } else {
        // no-match: route home
        router.push("/");
    }
}

// Toggle theme preference
function setTheme(dark: boolean) {
    isDark.value = dark;
    try {
        if (dark) {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        } else {
            document.documentElement.setAttribute("data-theme", "light");
            localStorage.setItem("theme", "light");
        }
    } catch (error) {
        // ignore localStorage errors in some environments
    }
}

function toggleTheme() {
    setTheme(!isDark.value);
}

// Initial theme setup on mount
onMounted(() => {
    try {
        const saved = localStorage.getItem("theme");
        if (saved) {
            setTheme(saved === "dark");
            return;
        }
        const prefers =
            window.matchMedia &&
            window.matchMedia("(prefers-color-scheme: dark)").matches;
        setTheme(Boolean(prefers));
    } catch (e) {
        // ignore
    }
});

// Language persistence: save to localStorage when changed
watch(locale, (newLocale) => {
    try {
        localStorage.setItem("locale", newLocale.value);
    } catch (error) {
        // ignore localStorage errors
    }
});

// Load saved locale on mount
onMounted(() => {
    try {
        const savedLocale = localStorage.getItem("locale");
        if (savedLocale === "en" || savedLocale === "zh") {
            locale.value = savedLocale;
        } else {
            // Try to detect from browser language
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith("zh")) {
                locale.value = "zh";
            } else {
                locale.value = "en";
            }
        }
    } catch (e) {
        // ignore
    }
});

// When the route changes, we can optionally adapt the UI: clear search when navigating away
watch(route, () => {
    // Keep the search entry but close suggestions by clearing if route is home
    if (route.name === "Home") {
        // do nothing
    }
});
</script>

<style scoped>
/* Scoped tweaks that complement global styles */
.header .brand a {
    text-decoration: none;
    color: var(--accent);
    display: flex;
    gap: 10px;
    align-items: center;
}
.logo {
    background: var(--accent-foreground);
    color: var(--accent);
    padding: 6px 10px;
    border-radius: var(--radius-sm);
    font-weight: 800;
}
.header .search input {
    min-width: 280px;
}
.sidebar .card {
    padding: 1.25rem;
    border-radius: var(--radius);
    box-shadow: var(--shadow-md);
    background: var(--card);
    border: 1px solid var(--border);
}
.sidebar .muted {
    color: var(--muted);
    font-size: 0.85rem;
}
.command-list .command-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
}
.command-list .command-item .kv {
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: 3px;
}
.command-list .command-item.active {
    border-color: var(--accent);
    box-shadow: var(--shadow-md);
}
.main {
    width: 100%;
}
.page-card {
    min-height: 60vh;
}

/* Language select */
.lang-select {
    border: 1.5px solid var(--border);
    padding: 0.5rem 0.75rem;
    border-radius: var(--radius-sm);
    background: var(--card);
    color: var(--text);
    font-weight: 600;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all var(--transition-fast);
}
.lang-select:hover {
    border-color: var(--accent);
    box-shadow: var(--shadow-sm);
}
.lang-select:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(8, 145, 178, 0.1);
}
[data-theme="dark"] .lang-select:focus {
    box-shadow: 0 0 0 3px rgba(34, 211, 238, 0.15);
}

/* Theme toggle button */
.theme-toggle {
    min-width: 44px;
    justify-content: center;
    padding: 0.625rem;
}
.theme-icon {
    font-size: 1.2rem;
    transition: transform var(--transition-fast);
}
.theme-toggle:hover .theme-icon {
    transform: rotate(15deg) scale(1.1);
}

@media (max-width: 900px) {
    .header .search input {
        min-width: 160px;
    }
    .container {
        grid-template-columns: 1fr !important;
    }
}
</style>
