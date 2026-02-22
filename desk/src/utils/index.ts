import { dom } from "./dom";
import { user } from "./user";
import { model } from "../data/model";
import { defineForm } from "../runtime/formContext";
import { defineList } from "../runtime/listRuntime";
import { resource } from "./resource";
import { defaults } from "./defaults";
import { datetime } from "./datetime";
import { datatype } from "./datatype";
import { utils } from "./utils";
import { db } from "./db";

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
  number_format_info,
  sys_defaults: {},
  utils,
  datetime,
  defaults,
  dom,
  user,
  model,
  db,
};

(window as any).defineForm = defineForm;
(window as any).defineList = defineList;
Object.assign(window, datatype);
