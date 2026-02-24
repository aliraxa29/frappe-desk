import { dom } from "./dom";
import { user } from "./user";
import { model } from "../data/model";
import { defineForm } from "../runtime/formContext";
import { defineList } from "../runtime/listRuntime";
import { defaults } from "./defaults";
import { datetime } from "./datetime";
import { datatype } from "./datatype";
import { utils } from "./utils";
import { db } from "./db";
import { __, __n, format as formatStr, get_languages } from "./translate";
import { session } from "./session";
import { meta } from "./meta";
import { perm } from "./perm";
import { resource } from "./resource";
import { provide } from "./provide";
import { format, get_formatter, get_format_helper } from "./formatters/helpers";
import { link_formatters } from "./formatters/link_formatters";
import { evaluateDependsOn } from "./dependsOn";
import {
  fuzzyMatch,
  getMarkedString,
  fuzzySearchWithMarking,
} from "./fuzzyMatch";
import { SearchManager } from "./searchManager";

const number_format_info: Record<
  string,
  { decimal_str: string; group_sep: string }
> = {
  "#,###.##": { decimal_str: ".", group_sep: "," },
  "#.###,##": { decimal_str: ",", group_sep: "." },
  "# ###.##": { decimal_str: ".", group_sep: " " },
  "# ###,##": { decimal_str: ",", group_sep: " " },
  "#'###.##": { decimal_str: ".", group_sep: "'" },
  "#, ###.##": { decimal_str: ".", group_sep: ", " },
  "#,##,###.##": { decimal_str: ".", group_sep: "," },
  "#,###.###": { decimal_str: ".", group_sep: "," },
  "#.###": { decimal_str: "", group_sep: "." },
  "#,###": { decimal_str: "", group_sep: "," },
};

window.desk = {
  defaultDateFormat: "YYYY-MM-DD",
  defaultTimeFormat: "HH:mm:ss",
  defaultDatetimeFormat: "YYYY-MM-DD HH:mm:ss",
  user_defaults: {},
  user_info: {},
  user_roles: [],
  number_format_info,
  sys_defaults: {},
  session,
  utils,
  datetime,
  defaults,
  dom,
  user,
  model,
  db,
  meta,
  perm,
  provide,
  get_languages,
  call: resource.call,
  xcall: resource.call,
  format,
  get_formatter,
  get_format_helper,
  link_formatters,
  evaluate_depends_on: evaluateDependsOn,
  fuzzy_match: fuzzyMatch,
  get_marked_string: getMarkedString,
  fuzzy_search: fuzzySearchWithMarking,
  search_manager: null as SearchManager | null,
  resource,
};

// Expose defineForm/defineList globally for custom scripts
(window as any).defineForm = defineForm;
(window as any).defineList = defineList;

// Expose all datatype functions as global variables
Object.assign(window, datatype);

// Expose translation functions globally
window.__ = __;
(window as any).__n = __n;
(window as any).format = formatStr;
