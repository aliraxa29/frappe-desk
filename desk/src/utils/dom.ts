type CSSStyles = Partial<CSSStyleDeclaration>;

export interface DeskDom {
  id_count: number;
  freeze_count: number;
  by_id(id: string): HTMLElement | null;
  get_unique_id(): string;
  set_unique_id(ele: HTMLElement): string;
  remove_script_and_style(html: string): string;
  freeze(msg?: string, cssClass?: string): void;
  unfreeze(): void;
  eval(code?: string): void;
  is_element_in_viewport(el: Element, tolerance?: number): boolean;
  is_element_in_modal(el: Element): boolean;
  set_style(css: string, id?: string): HTMLStyleElement | void;
  add(
    parent: HTMLElement | string | null,
    tag: string,
    className?: string,
    css?: CSSStyles,
    html?: string,
    onclick?: (e: MouseEvent) => void,
  ): HTMLElement;
  css(el: HTMLElement, styles: CSSStyles): HTMLElement;
  save_selection(): Range[] | null;
  restore_selection(ranges: Range[] | null): void;
  is_touchscreen(): boolean;
  scroll_to_bottom(container: HTMLElement): void;
  file_to_base64(file: File): Promise<string | ArrayBuffer | null>;
  pixel_to_inches(px: number): number;
  ellipsis(text: string, max?: number): string;
  run_serially(tasks: Array<() => Promise<unknown> | void>): Promise<void>;
  load_image(
    src: string,
    onload: (img: HTMLImageElement) => void,
    onerror?: () => void,
    preprocess?: (img: HTMLImageElement) => void,
  ): void;
  timeout(seconds: number): Promise<void>;
  scrub(text: string, spacer?: string): string;
  is_online(): boolean;
}

export const dom: DeskDom = {
  id_count: 0,
  freeze_count: 0,

  by_id(id: string): HTMLElement | null {
    return document.getElementById(id);
  },

  get_unique_id(): string {
    return `unique-${this.id_count++}`;
  },

  set_unique_id(ele: HTMLElement): string {
    if (ele.id) return ele.id;
    const id = `unique-${this.id_count++}`;
    ele.id = id;
    return id;
  },

  eval(code?: string) {
    if (!code) return;
    const script = document.createElement("script");
    script.textContent = code;
    document.head.appendChild(script);
  },

  remove_script_and_style(html: string): string {
    const forbidden = [
      "script",
      "style",
      "noscript",
      "title",
      "meta",
      "base",
      "head",
    ];

    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    let modified = !!doc.head.innerHTML;

    for (const tag of forbidden) {
      doc.body.querySelectorAll(tag).forEach((el) => {
        modified = true;
        el.remove();
      });
    }

    doc.body.querySelectorAll("link[rel='stylesheet']").forEach((el) => {
      modified = true;
      el.remove();
    });

    return modified ? doc.body.innerHTML : html;
  },

  is_element_in_viewport(el: Element, tolerance = 0): boolean {
    const rect = el.getBoundingClientRect();
    return (
      rect.top + tolerance >= 0 &&
      rect.left + tolerance >= 0 &&
      rect.bottom - tolerance <= window.innerHeight &&
      rect.right - tolerance <= window.innerWidth
    );
  },

  is_element_in_modal(el: Element): boolean {
    return Boolean(el.closest(".modal"));
  },

  set_style(css: string, id?: string): HTMLStyleElement | void {
    if (!css) return;

    if (id) {
      document.getElementById(id)?.remove();
    }

    const style = document.createElement("style");
    style.type = "text/css";
    if (id) style.id = id;
    style.textContent = css;
    document.head.appendChild(style);
    return style;
  },

  add(
    parent: HTMLElement | string | null,
    tag: string,
    className?: string,
    css?: CSSStyles,
    html?: string,
    onclick?: (e: MouseEvent) => void,
  ): HTMLElement {
    if (typeof parent === "string") {
      parent = this.by_id(parent);
    }

    const el = document.createElement(tag);

    if (className) {
      if (tag.toLowerCase() === "img") {
        (el as HTMLImageElement).src = className;
      } else {
        el.className = className;
      }
    }

    if (css) Object.assign(el.style, css);
    if (html) el.innerHTML = html;
    if (onclick) el.onclick = onclick;

    parent?.appendChild(el);
    return el;
  },

  css(el: HTMLElement, styles: CSSStyles): HTMLElement {
    Object.assign(el.style, styles);
    return el;
  },

  freeze(message = "", cssClass?: string) {
    let freeze = document.getElementById("freeze");

    if (!freeze) {
      freeze = document.createElement("div");
      freeze.id = "freeze";
      freeze.className = "modal-backdrop fade";
      freeze.innerHTML = `
					<div class="freeze-message-container">
						<div class="freeze-message">
							<p class="lead">${message}</p>
						</div>
					</div>
				`;
      document.body.appendChild(freeze);
      setTimeout(() => freeze?.classList.add("in"), 1);
    } else {
      freeze.classList.add("in");
    }

    if (cssClass) freeze.classList.add(cssClass);
    this.freeze_count++;
  },

  unfreeze() {
    if (!this.freeze_count) return;
    this.freeze_count--;

    if (!this.freeze_count) {
      document.getElementById("freeze")?.remove();
    }
  },

  save_selection(): Range[] | null {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;

    const ranges: Range[] = [];
    for (let i = 0; i < sel.rangeCount; i++) {
      ranges.push(sel.getRangeAt(i));
    }
    return ranges;
  },

  restore_selection(ranges: Range[] | null) {
    if (!ranges) return;
    const sel = window.getSelection();
    if (!sel) return;

    sel.removeAllRanges();
    ranges.forEach((r) => sel.addRange(r));
  },

  is_touchscreen(): boolean {
    return "ontouchstart" in window;
  },

  scroll_to_bottom(container: HTMLElement) {
    container.scrollTop = container.scrollHeight;
  },

  file_to_base64(file: File): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.readAsDataURL(file);
    });
  },

  pixel_to_inches(px: number): number {
    const div = document.createElement("div");
    div.style.width = "1in";
    div.style.position = "fixed";
    div.style.left = "100%";
    document.body.appendChild(div);

    const dpi = div.offsetWidth;
    div.remove();

    return px / dpi;
  },

  ellipsis(text: string, max = 20): string {
    if (!text) return "";
    return text.length > max ? `${text.slice(0, max)}...` : text;
  },

  run_serially(tasks: Array<() => Promise<unknown> | void>) {
    return tasks.reduce((p, task) => p.then(() => task?.()), Promise.resolve());
  },

  load_image(
    src: string,
    onload: (img: HTMLImageElement) => void,
    onerror?: () => void,
    preprocess: (img: HTMLImageElement) => void = () => {},
  ) {
    const img = new Image();
    preprocess(img);
    img.onload = () => onload(img);
    img.onerror = () => onerror?.();
    img.src = src;
  },

  timeout(seconds: number) {
    return new Promise<void>((resolve) => {
      setTimeout(resolve, seconds * 1000);
    });
  },

  scrub(text: string, spacer = "_"): string {
    return text.replace(/ /g, spacer).toLowerCase();
  },

  is_online(): boolean {
    return "onLine" in navigator ? navigator.onLine : true;
  },
};

window.addEventListener("online", () => {
  if (document.hidden) return;
  console.info("You are connected to internet.");
});

window.addEventListener("offline", () => {
  if (document.hidden) return;
  console.warn("Connection lost. Some features might not work.");
});
