import { reactive, nextTick } from "vue";
import {
  LIST_SCRIPT_EVENTS,
  type DocTypeMeta,
  type Document,
  type Field,
  type FilterRow,
  type ListColumn,
  type ListContext,
  type ListviewSettings,
} from "../types";
import { frappeClient } from "../api/resource";
import { toast } from "../stores/toast";
import { dialog } from "../stores/dialog";
import { model } from "../data/model";
import { __ } from "../utils/translate";
import { loadScript } from "../runtime/scriptLoader";
import { registry } from "../runtime/registry";

/**
 * ListView Class – Comprehensive list view controller
 */
export class ListView {
  doctype: string;
  meta: DocTypeMeta | null;
  data: Document[];
  totalCount: number;
  currentPage: number;
  pageLength: number;
  sortField: string;
  sortOrder: "asc" | "desc";
  filters: FilterRow[];
  selectedRows: string[];
  loading: boolean;
  error: string;
  ready: boolean;
  settings: ListviewSettings;

  private _events: Record<
    string,
    Array<(list: ListView) => void | Promise<void>>
  >;
  private _openDocument: ((name: string) => void) | null;

  constructor(doctype: string, meta: DocTypeMeta | null = null) {
    this.doctype = doctype;
    this.meta = meta;

    this.data = reactive([]);
    this.totalCount = 0;
    this.currentPage = 0;
    this.pageLength = 20;

    this.sortField = meta?.sort_field || "modified";
    this.sortOrder = (meta?.sort_order as "asc" | "desc") || "desc";

    this.filters = reactive([]);
    this.selectedRows = reactive([]);

    this.loading = false;
    this.error = "";
    this.ready = false;

    this.settings = reactive<ListviewSettings>({});

    this._events = {};
    this._openDocument = null;
  }

  /**
   * Load doctype metadata, inject scripts, load settings, fire onload.
   */
  async init(): Promise<void> {
    try {
      if (!this.meta) {
        this.meta = await this._loadMeta();
      }

      if (this.meta) {
        if (this.meta.sort_field) this.sortField = this.meta.sort_field;
        if (this.meta.sort_order)
          this.sortOrder = this.meta.sort_order as "asc" | "desc";

        loadScript(this.meta, "list");
      }
      await nextTick();

      this._loadSettings();

      this._bindRegisteredHandlers();

      await this.trigger("setup");
      await this.trigger("onload");

      this.ready = true;
    } catch (err: any) {
      console.error("ListView init failed:", err);
      this.error = err.message || "Failed to initialize list view";
    }
  }

  /**
   * Fetch list data from server with current filters, sort, pagination.
   */
  async refresh(): Promise<void> {
    this.loading = true;
    this.error = "";

    try {
      await this.trigger("before_render");

      const filters = this._buildServerFilters();
      const fetchFields = this._getFetchFields();

      const response = await frappeClient.getList(this.doctype, {
        fields: fetchFields,
        filters,
        limit_page_length: this.pageLength,
        limit_start: this.currentPage * this.pageLength,
        order_by: `${this.sortField} ${this.sortOrder}`,
      });

      this.data.splice(0, this.data.length, ...(response.data || []));

      await this._fetchTotalCount(filters);

      await this.trigger("refresh");
      await this.trigger("render");

      if (this.settings.refresh) {
        try {
          this.settings.refresh(this);
        } catch (err) {
          console.error("Listview refresh hook error:", err);
        }
      }
    } catch (err: any) {
      console.error("Failed to load list:", err);
      this.error = err.message || "Failed to load list";
    } finally {
      this.loading = false;
    }
  }

  /**
   * Set a filter. If the field already has a filter, update its value.
   */
  set_filter(fieldname: string, value: any, operator: string = "="): void {
    const existing = this.filters.find((f) => f.fieldname === fieldname);
    if (existing) {
      existing.value = value;
      existing.operator = operator;
    } else {
      this.filters.push({
        id: `f_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
        fieldname,
        operator,
        value,
      });
    }
  }

  /**
   * Remove a filter by fieldname.
   */
  remove_filter(fieldname: string): void {
    const idx = this.filters.findIndex((f) => f.fieldname === fieldname);
    if (idx >= 0) this.filters.splice(idx, 1);
  }

  /**
   * Remove a filter by id.
   */
  remove_filter_by_id(id: string): void {
    const idx = this.filters.findIndex((f) => f.id === id);
    if (idx >= 0) this.filters.splice(idx, 1);
  }

  /**
   * Clear all filters.
   */
  clear_filters(): void {
    this.filters.splice(0, this.filters.length);
  }

  /**
   * Check if there are active filters with values.
   */
  has_active_filters(): boolean {
    return this.filters.some((f) => {
      if (f.operator === "between") return f.value?.from || f.value?.to;
      return f.value !== undefined && f.value !== null && f.value !== "";
    });
  }

  /**
   * Apply current filters and reset to page 0.
   */
  async apply_filters(): Promise<void> {
    this.currentPage = 0;
    await this.refresh();
  }

  /**
   * Toggle sort on a field.
   */
  toggle_sort(fieldname: string): void {
    if (this.sortField === fieldname) {
      this.sortOrder = this.sortOrder === "asc" ? "desc" : "asc";
    } else {
      this.sortField = fieldname;
      this.sortOrder = "asc";
    }
    this.currentPage = 0;
  }

  /**
   * Set sort explicitly.
   */
  set_sort(fieldname: string, order: "asc" | "desc" = "asc"): void {
    this.sortField = fieldname;
    this.sortOrder = order;
    this.currentPage = 0;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.totalCount / this.pageLength));
  }

  get startIndex(): number {
    return this.currentPage * this.pageLength;
  }

  get endIndex(): number {
    return Math.min(this.startIndex + this.data.length, this.totalCount);
  }

  get hasNextPage(): boolean {
    return this.endIndex < this.totalCount;
  }

  get hasPrevPage(): boolean {
    return this.currentPage > 0;
  }

  prev_page(): void {
    if (this.hasPrevPage) this.currentPage--;
  }

  next_page(): void {
    if (this.hasNextPage) this.currentPage++;
  }

  go_to_page(page: number): void {
    if (page < 0) page = 0;
    if (page >= this.totalPages) page = this.totalPages - 1;
    this.currentPage = page;
  }

  set_page_length(length: number): void {
    this.pageLength = length;
    this.currentPage = 0;
  }

  /**
   * Get selected document names.
   */
  get_checked_items(): Document[] {
    return this.data.filter((d) => this.selectedRows.includes(d.name!));
  }

  /**
   * Select all visible rows.
   */
  select_all(): void {
    this.selectedRows.splice(
      0,
      this.selectedRows.length,
      ...this.data.map((r) => r.name!),
    );
  }

  /**
   * Deselect all.
   */
  deselect_all(): void {
    this.selectedRows.splice(0, this.selectedRows.length);
  }

  /**
   * Toggle selection of a single row.
   */
  toggle_select(name: string): void {
    const idx = this.selectedRows.indexOf(name);
    if (idx >= 0) {
      this.selectedRows.splice(idx, 1);
    } else {
      this.selectedRows.push(name);
    }
  }

  get isAllSelected(): boolean {
    return (
      this.data.length > 0 && this.selectedRows.length === this.data.length
    );
  }

  get isPartiallySelected(): boolean {
    return (
      this.selectedRows.length > 0 &&
      this.selectedRows.length < this.data.length
    );
  }

  /**
   * Set the document-open handler (called by the Vue component).
   */
  setOpenDocumentHandler(handler: (name: string) => void): void {
    this._openDocument = handler;
  }

  /**
   * Open a document in form view.
   */
  open_document(name: string): void {
    if (this._openDocument) {
      this._openDocument(name);
    }
  }

  /**
   * Get columns to display (respects custom script overrides).
   */
  get_columns(): ListColumn[] {
    if (!this.meta) return [];

    const fields = this.meta.fields || [];
    const settings = this.settings;

    if (settings.columns?.length) {
      return settings.columns.map((col) => {
        const df = fields.find((f) => f.fieldname === col.fieldname);
        return {
          type: "Field" as const,
          df:
            df ||
            ({
              fieldname: col.fieldname,
              label: col.label || col.fieldname,
              fieldtype: "Data",
              reqd: 0,
              read_only: 0,
              hidden: 0,
            } as Field),
          label: col.label || df?.label || col.fieldname,
          fieldname: col.fieldname,
          width: col.width,
        };
      });
    }

    const cols: ListColumn[] = [];

    const titleField = this.meta.title_field;
    if (titleField) {
      const df = fields.find((f) => f.fieldname === titleField);
      cols.push({
        type: "Subject",
        df:
          df ||
          ({
            fieldname: titleField,
            label: titleField,
            fieldtype: "Data",
            reqd: 0,
            read_only: 0,
            hidden: 0,
          } as Field),
        label: df?.label || "ID",
        fieldname: titleField,
      });
    } else {
      cols.push({ type: "Subject", label: "Name", fieldname: "name" });
    }

    const statusField = fields.find((f) => f.fieldname === "status");
    if (statusField) {
      cols.push({
        type: "Status",
        df: statusField,
        label: "Status",
        fieldname: "status",
      });
    }

    const listViewFields = fields
      .filter(
        (f) =>
          f.in_list_view &&
          !f.hidden &&
          f.fieldname !== titleField &&
          f.fieldname !== "status" &&
          ![
            "Section Break",
            "Column Break",
            "Tab Break",
            "Table",
            "HTML",
          ].includes(f.fieldtype),
      )
      .sort((a, b) => ((a as any).idx || 0) - ((b as any).idx || 0));

    listViewFields.forEach((df) => {
      cols.push({
        type: "Field",
        df,
        label: df.label,
        fieldname: df.fieldname,
      });
    });

    return cols.slice(0, 8);
  }

  /**
   * Get fields to fetch from the server.
   */
  get_fetch_fields(): string[] {
    return this._getFetchFields();
  }

  /**
   * Get all fields available for filtering.
   */
  get_filterable_fields(): Field[] {
    if (!this.meta) return [];
    return this.meta.fields
      .filter(
        (f) =>
          !f.hidden &&
          ![
            "Section Break",
            "Column Break",
            "Tab Break",
            "Table",
            "HTML",
            "Button",
            "Table MultiSelect",
          ].includes(f.fieldtype),
      )
      .sort((a, b) =>
        (a.label || a.fieldname).localeCompare(b.label || b.fieldname),
      );
  }

  /**
   * Delete selected documents.
   */
  async bulk_delete(): Promise<void> {
    const count = this.selectedRows.length;
    if (count === 0) return;

    const confirmed = await dialog.confirm(
      __("Delete Records"),
      __(
        `Are you sure you want to delete ${count} ${
          count === 1 ? "record" : "records"
        }? This action cannot be undone.`,
      ),
    );
    if (!confirmed) return;

    try {
      for (const name of this.selectedRows) {
        await frappeClient.deleteDocument(this.doctype, name);
      }
      toast.success(__(`Deleted ${count} records`));
      this.deselect_all();
      await this.refresh();
    } catch (err: any) {
      toast.error(__("Delete failed"), err.message);
    }
  }

  /**
   * Bulk update a field on selected documents.
   */
  async bulk_set_value(fieldname: string, value: any): Promise<void> {
    const count = this.selectedRows.length;
    if (count === 0) return;

    try {
      for (const name of this.selectedRows) {
        await frappeClient.callMethod("frappe.client.set_value", {
          doctype: this.doctype,
          name,
          fieldname: { [fieldname]: value },
        });
      }
      toast.success(__(`Updated ${count} records`));
      this.deselect_all();
      await this.refresh();
    } catch (err: any) {
      toast.error(__("Bulk edit failed"), err.message);
    }
  }

  /**
   * Assign selected documents to a user.
   */
  async bulk_assign(user: string): Promise<void> {
    const count = this.selectedRows.length;
    if (count === 0) return;

    try {
      for (const name of this.selectedRows) {
        await frappeClient.callMethod("frappe.desk.form.assign_to.add", {
          doctype: this.doctype,
          name,
          assign_to: [user],
        });
      }
      toast.success(__(`Assigned ${count} records to ${user}`));
      this.deselect_all();
    } catch (err: any) {
      toast.error(__("Assign failed"), err.message);
    }
  }

  /**
   * Add a tag to selected documents.
   */
  async bulk_add_tag(tag: string): Promise<void> {
    const count = this.selectedRows.length;
    if (count === 0) return;

    try {
      for (const name of this.selectedRows) {
        await frappeClient.callMethod("frappe.desk.doctype.tag.tag.add_tag", {
          tag,
          dt: this.doctype,
          dn: name,
        });
      }
      toast.success(__(`Added tag "${tag}" to ${count} records`));
      this.deselect_all();
    } catch (err: any) {
      toast.error(__("Add tag failed"), err.message);
    }
  }

  /**
   * Print selected documents.
   */
  bulk_print(): void {
    const names = this.selectedRows.join(",");
    window.open(
      `/api/method/frappe.utils.print_format.download_multi_pdf?doctype=${this.doctype}&name=${names}`,
      "_blank",
    );
  }

  /**
   * Get indicator for a row (from custom script or default).
   */
  get_indicator(doc: Document): [string, string] | null {
    if (this.settings.get_indicator) {
      try {
        return this.settings.get_indicator(doc);
      } catch {
        return null;
      }
    }
    return null;
  }

  /**
   * Check if custom row actions are defined.
   */
  get hasRowActions(): boolean {
    return (
      !!this.settings.button || (this.settings.row_actions?.length ?? 0) > 0
    );
  }

  /**
   * Get visible row actions for a document.
   */
  get_visible_row_actions(
    doc: Document,
  ): Array<{ label: string; action: (doc: Document) => void }> {
    return (this.settings.row_actions || []).filter(
      (action) => !action.show || action.show(doc),
    );
  }

  notify(
    msg: string,
    type: "success" | "error" | "warning" | "info" = "info",
  ): void {
    toast.show({ type, title: msg });
  }

  /** Register an event handler. */
  on(event: string, handler: (list: ListView) => void | Promise<void>): void {
    if (!this._events[event]) {
      this._events[event] = [];
    }
    this._events[event].push(handler);
  }

  /** Remove an event handler. */
  off(event: string, handler?: (list: ListView) => void | Promise<void>): void {
    if (!handler) {
      delete this._events[event];
    } else {
      const handlers = this._events[event];
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index >= 0) handlers.splice(index, 1);
      }
    }
  }

  /**
   * Trigger an event. Returns false if any handler returned false.
   */
  async trigger(event: string): Promise<boolean | void> {
    const handlers = this._events[event] || [];
    for (const handler of handlers) {
      try {
        const result = (await handler(this)) as unknown;
        if (result === false) return false;
      } catch (err) {
        console.error(`Error in ${this.doctype} list.${event}:`, err);
      }
    }
  }

  /**
   * Bind all handlers from a handler map (from desk.defineList()).
   * Standard events go to the event system.
   */
  bindHandlers(handlers: Record<string, any>): void {
    for (const [key, handler] of Object.entries(handlers)) {
      if (typeof handler !== "function") continue;

      if ((LIST_SCRIPT_EVENTS as readonly string[]).includes(key)) {
        this.on(key, handler as (list: ListView) => void);
      }
    }

    if (handlers.get_indicator)
      this.settings.get_indicator = handlers.get_indicator;
    if (handlers.formatters) this.settings.formatters = handlers.formatters;
    if (handlers.button) this.settings.button = handlers.button;
    if (handlers.primary_action)
      this.settings.primary_action = handlers.primary_action;
    if (handlers.row_actions) this.settings.row_actions = handlers.row_actions;
    if (handlers.add_fields) this.settings.add_fields = handlers.add_fields;
    if (handlers.columns) this.settings.columns = handlers.columns;
    if (handlers.hide_name_column !== undefined)
      this.settings.hide_name_column = handlers.hide_name_column;
    if (handlers.hide_serial_column !== undefined)
      this.settings.hide_serial_column = handlers.hide_serial_column;
    if (handlers.show_id_column !== undefined)
      this.settings.show_id_column = handlers.show_id_column;
  }

  /**
   * Build a ListContext object for backward-compatible APIs.
   */
  toListContext(): ListContext {
    return {
      doctype: this.doctype,
      meta: this.meta,
      data: this.data,
      filters: this.filters,
      columns: this.get_columns(),
      selected: this.selectedRows,
      page_length: this.pageLength,
      current_page: this.currentPage,
      total_count: this.totalCount,
      sort_field: this.sortField,
      sort_order: this.sortOrder,
      refresh: () => this.refresh(),
      set_filter: (fieldname: string, value: any) =>
        this.set_filter(fieldname, value),
      remove_filter: (fieldname: string) => this.remove_filter(fieldname),
      clear_filters: () => this.clear_filters(),
      get_checked_items: () => this.get_checked_items(),
      set_page_length: (length: number) => this.set_page_length(length),
      toggle_sort: (fieldname: string) => this.toggle_sort(fieldname),
      open_document: (name: string) => this.open_document(name),
    };
  }

  private async _loadMeta(): Promise<DocTypeMeta | null> {
    if ((window as any).locals?.DocType?.[this.doctype]) {
      return (window as any).locals.DocType[this.doctype] as DocTypeMeta;
    }

    return new Promise((resolve) => {
      model.with_doctype(this.doctype, (result: any) => {
        resolve((result?.message as DocTypeMeta) || null);
      });
    });
  }

  private _loadSettings(): void {
    try {
      const global =
        (window as any).desk?.listview_settings?.[this.doctype] ||
        (window as any).frappe?.listview_settings?.[this.doctype] ||
        {};

      Object.assign(this.settings, global);
    } catch (err) {
      console.error("Failed to load listview settings:", err);
    }
  }

  private _bindRegisteredHandlers(): void {
    const handlerSets = registry.lists[this.doctype] || [];
    for (const handlers of handlerSets) {
      this.bindHandlers(handlers);
    }

    const listRuntimeHandlers =
      (window as any).__listRegistry?.[this.doctype] || [];
    for (const handlers of listRuntimeHandlers) {
      this.bindHandlers(handlers);
    }
  }

  private _getFetchFields(): string[] {
    const fields = new Set([
      "name",
      "modified",
      "creation",
      "owner",
      "docstatus",
      "_liked_by",
    ]);

    const columns = this.get_columns();
    columns.forEach((col) => {
      if (col.fieldname) fields.add(col.fieldname);
      if (col.df?.fieldname) fields.add(col.df.fieldname);
    });

    if (this.settings.add_fields) {
      this.settings.add_fields.forEach((f) => fields.add(f));
    }

    return Array.from(fields);
  }

  private _buildServerFilters(): any[] {
    const filters: any[] = [];

    this.filters.forEach((row) => {
      if (!row.fieldname || !row.operator) return;

      if (row.operator === "between") {
        const from = row.value?.from;
        const to = row.value?.to;
        if (from || to) {
          filters.push([row.fieldname, "between", [from, to]]);
        }
        return;
      }

      if (row.operator === "in" || row.operator === "not in") {
        if (typeof row.value === "string") {
          const parts = row.value
            .split(",")
            .map((v: string) => v.trim())
            .filter(Boolean);
          if (parts.length) filters.push([row.fieldname, row.operator, parts]);
        } else if (Array.isArray(row.value)) {
          filters.push([row.fieldname, row.operator, row.value]);
        }
        return;
      }

      if (row.operator === "is") {
        if (row.value === "set") filters.push([row.fieldname, "is", "set"]);
        else if (row.value === "not set")
          filters.push([row.fieldname, "is", "not set"]);
        return;
      }

      if (row.value !== undefined && row.value !== null && row.value !== "") {
        const value =
          row.operator === "like" && typeof row.value === "string"
            ? `%${row.value}%`
            : row.value;
        filters.push([row.fieldname, row.operator, value]);
      }
    });

    return filters;
  }

  private async _fetchTotalCount(filters: any[]): Promise<void> {
    try {
      const response = await frappeClient.callMethod(
        "frappe.client.get_count",
        {
          doctype: this.doctype,
          filters,
        },
      );
      this.totalCount = response || 0;
    } catch {
      this.totalCount = this.data.length;
    }
  }

  /**
   * Cleanup event handlers and state.
   */
  destroy(): void {
    this._events = {};
    this.data.splice(0, this.data.length);
    this.selectedRows.splice(0, this.selectedRows.length);
    this.filters.splice(0, this.filters.length);
  }
}

/**
 * Create a new ListView instance.
 */
export function createListView(
  doctype: string,
  meta?: DocTypeMeta | null,
): ListView {
  return new ListView(doctype, meta || null);
}
