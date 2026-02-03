export function __(txt: string, replace: string = "", context = null) {
    if (!txt)
        return txt;

    if (typeof txt != "string") return txt;

    let translated_text = "";

    let key = txt;
    if (context) {
        translated_text = window.desk?._messages[`${key}:${context}`];
    }

    if (!translated_text) {
        translated_text = window.desk?._messages[key] || txt;
    }

    if (replace && typeof replace === "object") {
        translated_text = translated_text.replace(/\{\{(\w+)\}\}/g, function (match, p1) {
            return replace[p1] || match;
        });
    }
    return translated_text;
};

export function get_languages() {
    if (!window.desk.languages) {
        window.desk.languages = [];
        window.desk.boot.lang_dict.array.forEach((element: any) => {
            window.desk.languages.push({ label: element.label, value: element.value });
        });
        window.desk.languages = window.desk.languages.sort(function (a: any, b: any) {
            return a.value < b.value ? -1 : 1;
        });
    }
    return window.desk.languages;
};