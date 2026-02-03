import type { LocalsStore } from "./locals";

export { }

declare global {
    interface Window {
        desk?: any
        dash?: any
        locals: LocalsStore;
        get_languages: () => { label: string; value: string }[];

        /**
         * Translation utility function
         * @param txt Text to translate
         * @param replace Replacement values
         * @param context Context for translation. e.g., "change", "cash"
         * @returns Translated string
         */
        __: (txt: string, replace: string, context?: string | null) => string;




        // constants
        NEWLINE?: string
        TAB?: number
        UP_ARROW?: number
        DOWN_ARROW?: number
    }
}