import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import "@/assets/main.css";
import { createKamI18n, type SupportedLocale } from "@/i18n";
import { registerNuxtUIIfAvailable } from "@/plugins/nuxtUi";
import { installClipboardHelper } from "@/runtime/clipboard";
import { installErrorOverlay } from "@/runtime/errorOverlay";
import { registerServiceWorker } from "@/runtime/serviceWorker";

const app = createApp(App);
const i18n = createKamI18n();

installErrorOverlay(app);
installClipboardHelper(app);

app.use(i18n);
app.config.globalProperties.$setLocale = (value: SupportedLocale) => {
  i18n.global.locale.value = value;
};

async function bootstrap() {
  await registerNuxtUIIfAvailable(app);
  app.use(router);
  app.mount("#app");
  await registerServiceWorker();
}

bootstrap();
