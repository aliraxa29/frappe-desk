import { __ } from "./translate";

export interface Datatype {
  cstr: (s: any) => string;
  strip_number_groups: (v: string, number_format?: any) => string;
  convert_old_to_new_number_format: (
    v: string,
    old_number_format?: string,
    new_number_format?: string,
  ) => string;
  format_number: (v: any, format?: string, decimals?: number) => string;
  format_currency: (v: any, currency: any, decimals?: number) => string;
  get_currency_symbol: (currency: any) => string | null | undefined;
  get_number_format: (currency?: any) => string;
  get_number_format_info: (format: any) => {
    decimal_str: string;
    group_sep: string;
    precision?: number;
  };
  _round: (num: any, precision?: any, rounding_method?: any) => number;
  roundNumber: (num: any, precision: any) => number;
  precision: (fieldname: any, doc?: any) => number;
  in_list: (list: any[], item: any) => boolean;
  remainder: (numerator: any, denominator: any, precision: any) => number;
  round_based_on_smallest_currency_fraction: (
    value: any,
    currency: any,
    precision: any,
  ) => number;
  flt: (
    v: any,
    decimals?: number,
    number_format?: any,
    rounding_method?: any,
  ) => number;
  cint: (v: any, def?: number) => number;
  toTitle: (str: string) => string;
  is_null: (v: any) => boolean;
  copy_dict: (d: Record<string, any>) => Record<string, any>;
  repl: (s: string, dict: Record<string, any>) => string;
  replace_all: (s: string, t1: string, t2: string) => string;
  strip_html: (txt: string) => string;
  strip: (s: string, chars?: string[]) => string | undefined;
  lstrip: (s: string, chars?: string[]) => string;
  rstrip: (s: string, chars?: string[]) => string;
  validate_email: (txt: string) => boolean;
  validate_phone: (txt: string) => boolean;
  validate_name: (txt: string) => boolean;
  validate_url: (txt: string) => boolean;
  nth: (number: any) => string;
  has_words: (list: string[], item: string) => boolean;
  has_common: (list1: any[], list2: any[]) => boolean;
}

export const datatype: Datatype = {
  cstr(s: any): string {
    if (s == null) return "";
    return s + "";
  },

  strip_number_groups(v: string, number_format?: any): string {
    if (!number_format) number_format = this.get_number_format();
    const info = this.get_number_format_info(number_format);

    const group_regex = new RegExp(
      info.group_sep === "." ? "\\." : info.group_sep,
      "g",
    );
    v = v.replace(group_regex, "");

    if (info.decimal_str !== "." && info.decimal_str !== "") {
      const decimal_regex = new RegExp(info.decimal_str, "g");
      v = v.replace(decimal_regex, ".");
    }

    return v;
  },

  convert_old_to_new_number_format(
    v: string,
    old_number_format?: string,
    new_number_format?: string,
  ): string {
    if (!new_number_format) new_number_format = this.get_number_format();
    const new_info = this.get_number_format_info(new_number_format);

    if (!old_number_format) old_number_format = "#,###.##";
    const old_info = this.get_number_format_info(old_number_format);

    if (old_number_format === new_number_format) return v;

    if (new_info.decimal_str === "") {
      return this.strip_number_groups(v);
    }

    const v_parts = v.split(old_info.decimal_str);
    let v_before_decimal = v_parts[0];
    const v_after_decimal = v_parts[1] || "";

    const old_group_regex = new RegExp(
      old_info.group_sep === "." ? "\\." : old_info.group_sep,
      "g",
    );
    v_before_decimal = v_before_decimal.replace(
      old_group_regex,
      new_info.group_sep,
    );

    v = v_before_decimal;
    if (v_after_decimal) {
      v = v + new_info.decimal_str + v_after_decimal;
    }

    return v;
  },

  format_number(v: any, format?: string, decimals?: number): string {
    if (!format) {
      format = this.get_number_format();
      if (decimals == null) {
        decimals = this.flt(dash.defaults.get_default("float_precision")) || 3;
      }
    }

    const info = this.get_number_format_info(format);

    if (decimals == null) decimals = info.precision;

    v = this.flt(v, decimals, format);

    let is_negative = false;
    if (v < 0) is_negative = true;
    v = Math.abs(v);

    v = v.toFixed(decimals);

    const part = v.split(".");

    let group_position = info.group_sep ? 3 : 0;

    if (group_position) {
      const integer = part[0];
      let str = "";
      const offset = integer.length % group_position;

      for (let i = integer.length; i >= 0; i--) {
        let l = this.replace_all(str, info.group_sep, "").length;

        if (format === "#,##,###.##" && str.indexOf(",") !== -1) {
          group_position = 2;
          l += 1;
        }

        str += integer.charAt(i);

        if (l && !((l + 1) % group_position) && i !== 0) {
          str += info.group_sep;
        }
      }

      part[0] = str.split("").reverse().join("");
    }

    if (part[0] + "" === "") {
      part[0] = "0";
    }

    part[1] = part[1] && info.decimal_str ? info.decimal_str + part[1] : "";

    return (is_negative ? "-" : "") + part[0] + part[1];
  },

  format_currency(v: any, currency: any, decimals?: number): string {
    const format = this.get_number_format(currency);
    const symbol = this.get_currency_symbol(currency);
    const show_symbol_on_right =
      desk.model.get_value(":Currency", currency, "symbol_on_right") ?? false;

    if (decimals === undefined) {
      decimals = desk.boot.sysdefaults.currency_precision || null;
    }

    if (symbol) {
      if (show_symbol_on_right) {
        return this.format_number(v, format, decimals) + " " + __(symbol);
      }
      return __(symbol) + " " + this.format_number(v, format, decimals);
    }

    return this.format_number(v, format, decimals);
  },

  get_currency_symbol(currency: any): string | null | undefined {
    if (dash.boot) {
      if (dash.boot.sysdefaults?.hide_currency_symbol === "Yes") return null;

      if (!currency) currency = dash.boot.sysdefaults.currency;

      return desk.model.get_value(":Currency", currency, "symbol") || currency;
    }
  },

  get_number_format(currency?: any): string {
    const sysdefaults = desk?.boot?.sysdefaults;

    return (
      (cint(sysdefaults?.use_number_format_from_currency) &&
        currency &&
        desk.model.get_value(":Currency", currency, "number_format")) ||
      sysdefaults.number_format ||
      "#,###.##"
    );
  },

  get_number_format_info(format: any): {
    decimal_str: string;
    group_sep: string;
    precision?: number;
  } {
    let info = desk.number_format_info[format];

    if (!info) {
      info = { decimal_str: ".", group_sep: "," };
    }

    info.precision =
      info.decimal_str === ""
        ? 0
        : format.split(info.decimal_str).slice(1)[0].length;

    return info;
  },

  _round(num: any, precision?: any, rounding_method?: any): number {
    rounding_method =
      rounding_method ||
      dash.boot.sysdefaults.rounding_method ||
      "Banker's Rounding (legacy)";

    const is_negative = num < 0;

    if (rounding_method === "Banker's Rounding (legacy)") {
      const d = cint(precision);
      const m = Math.pow(10, d);
      const n = +(d ? Math.abs(num) * m : Math.abs(num)).toFixed(8);
      const i = Math.floor(n);
      const f = n - i;
      const r =
        !precision && f === 0.5 ? (i % 2 === 0 ? i : i + 1) : Math.round(n);
      const result = d ? r / m : r;
      return is_negative ? -result : result;
    }

    if (rounding_method === "Banker's Rounding") {
      if (num === 0) return 0.0;
      precision = cint(precision);

      const multiplier = Math.pow(10, precision);
      num = Math.abs(num) * multiplier;

      const floor_num = Math.floor(num);
      const decimal_part = num - floor_num;
      const epsilon = 2.0 ** (Math.log2(Math.abs(num)) - 52.0);

      if (Math.abs(decimal_part - 0.5) < epsilon) {
        num = floor_num % 2 === 0 ? floor_num : floor_num + 1;
      } else {
        num = Math.round(num);
      }

      num = num / multiplier;
      return is_negative ? -num : num;
    }

    if (rounding_method === "Commercial Rounding") {
      if (num === 0) return 0.0;

      const digits = cint(precision);
      const multiplier = Math.pow(10, digits);

      num = num * multiplier;

      let epsilon = 2.0 ** (Math.log2(Math.abs(num)) - 52.0);
      if (is_negative) epsilon = -epsilon;

      num = Math.round(num + epsilon);
      return num / multiplier;
    }

    throw new Error(`Unknown rounding method: ${rounding_method}`);
  },

  roundNumber(num: any, precision: any): number {
    return this._round(num, precision);
  },

  precision(fieldname: any, doc?: any): number {
    if (doc) {
      const df = desk.meta.get_docfield(
        doc.doctype,
        fieldname,
        doc.parent || doc.name,
      );
      if (!df)
        console.log(
          `${fieldname}: could not find docfield in method precision()`,
        );
      return desk.meta.get_field_precision(df, doc);
    }

    return dash.boot.sysdefaults.float_precision;
  },

  in_list(list: any[], item: any): boolean {
    return list.includes(item);
  },

  remainder(numerator: any, denominator: any, precision: any): number {
    precision = cint(precision);
    const multiplier = Math.pow(10, precision);

    const _remainder = precision
      ? ((numerator * multiplier) % (denominator * multiplier)) / multiplier
      : numerator % denominator;

    return this.flt(_remainder, precision);
  },

  round_based_on_smallest_currency_fraction(
    value: any,
    currency: any,
    precision: any,
  ): number {
    const smallest = this.flt(
      desk.model.get_value(
        ":Currency",
        currency,
        "smallest_currency_fraction_value",
      ),
    );

    if (smallest) {
      const remainder_val = this.remainder(value, smallest, precision);
      if (remainder_val > smallest / 2) {
        value += smallest - remainder_val;
      } else {
        value -= remainder_val;
      }
    } else {
      value = this._round(value);
    }

    return value;
  },

  flt(
    v: any,
    decimals?: number,
    number_format?: any,
    rounding_method?: any,
  ): number {
    if (v == null || v === "") return 0;

    if (typeof v !== "number") {
      v = v + "";

      if (v.indexOf(" ") !== -1) {
        const parts = v.split(" ");
        v = isNaN(parseFloat(parts[0]))
          ? parts.slice(parts.length - 1).join(" ")
          : v;
      }

      v = this.strip_number_groups(v, number_format);
      v = parseFloat(v);
      if (isNaN(v)) v = 0;
    }

    if (decimals != null) return this._round(v, decimals, rounding_method);
    return v;
  },

  cint(v: any, def?: number): number {
    if (v === true) return 1;
    if (v === false) return 0;
    v = v + "";
    if (v !== "0") v = this.lstrip(v, ["0"]);
    v = parseInt(v);
    if (isNaN(v)) v = def === undefined ? 0 : def;
    return v;
  },

  toTitle(str: string): string {
    return str
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  },

  is_null(v: any): boolean {
    return v === null || v === undefined || this.cstr(v).trim() === "";
  },

  copy_dict(d: Record<string, any>): Record<string, any> {
    return { ...d };
  },

  repl(s: string, dict: Record<string, any>): string {
    if (s == null) return "";
    for (const key in dict) {
      s = s.split(`%(${key})s`).join(dict[key]);
    }
    return s;
  },

  replace_all(s: string, t1: string, t2: string): string {
    return s.split(t1).join(t2);
  },

  strip_html(txt: string): string {
    return this.cstr(txt).replace(/<[^>]*>/g, "");
  },

  strip(s: string, chars?: string[]): string | undefined {
    if (!s) return;
    s = this.lstrip(s, chars);
    s = this.rstrip(s, chars);
    return s;
  },

  lstrip(s: string, chars?: string[]): string {
    if (!chars) chars = ["\n", "\t", " "];
    while (s.length && chars.includes(s[0])) {
      s = s.substring(1);
    }
    return s;
  },

  rstrip(s: string, chars?: string[]): string {
    if (!chars) chars = ["\n", "\t", " "];
    while (s.length && chars.includes(s[s.length - 1])) {
      s = s.substring(0, s.length - 1);
    }
    return s;
  },

  validate_email(txt: string): boolean {
    return desk.utils.validate_type(txt, "email");
  },

  validate_phone(txt: string): boolean {
    return desk.utils.validate_type(txt, "phone");
  },

  validate_name(txt: string): boolean {
    return desk.utils.validate_type(txt, "name");
  },

  validate_url(txt: string): boolean {
    return desk.utils.validate_type(txt, "url");
  },

  nth(number: any): string {
    const n = this.cint(number);
    const lastDigit = n % 10;
    const lastTwoDigits = n % 100;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 13) return n + "th";
    if (lastDigit === 1) return n + "st";
    if (lastDigit === 2) return n + "nd";
    if (lastDigit === 3) return n + "rd";
    return n + "th";
  },

  has_words(list: string[], item: string): boolean {
    if (!item) return true;
    if (!list) return false;
    return list.some((word) => item.includes(word));
  },

  has_common(list1: any[], list2: any[]): boolean {
    if (!list1 || !list2) return false;
    return list1.some((item) => list2.includes(item));
  },
};
