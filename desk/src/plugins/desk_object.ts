import type { App } from "vue";

export default {
  install(app: App) {
    app.config.globalProperties.desk = window.desk;
    app.config.globalProperties.dash = window.dash;
    app.config.globalProperties.locals = window.locals;
    app.config.globalProperties.get_languages = window.get_languages;
    app.config.globalProperties.__ = window.__;
  },
};
