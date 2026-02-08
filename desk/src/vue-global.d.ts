import type { LocalsStore } from "@/locals";

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    __: Window["__"];
    locals: LocalsStore;
    desk: Window["desk"];
    dash: Window["dash"];
    get_languages: Window["get_languages"];
  }
}
