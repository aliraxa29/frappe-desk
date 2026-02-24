import { DateTimeUtils } from "@/utils/datetime";
import { DeskCallOptions } from "./index";
import { Defaults } from "@/utils/defaults";
import { DOM } from "@/utils/dom";
import { User } from "@/utils/user";
import { Datatype } from "@/utils/datatype";
import { DB } from "@/utils/db";
import { BaseUtils } from "@/utils/utils";
import { RealTimeClient } from "@/utils/socketio/client";
import { Model } from "@/data/model";
import { Session } from "@/utils/session";
import { Locals } from "@/utils/locals";
import { Meta } from "@/utils/meta";
import { Perm } from "@/utils/perm";

export {};

declare global {
  interface Desk {
    defaultDateFormat: string;
    defaultDatetimeFormat: string;
    defaultTimeFormat: string;
    number_format_info: Record<
      string,
      { decimal_str: string; group_sep: string; precision?: number }
    >;
    session: Session;
    datetime: DateTimeUtils;
    defaults: Defaults;
    sys_defaults: any;
    db: DB;
    utils: BaseUtils;
    dom: DOM;
    user: User;
    model: Model;
    meta: Meta;
    perm: Perm;
    realtime: RealTimeClient;
    user_defaults: any;
    user_roles: string[];
    user_info: any;
    provide: (namespace: string) => any;
    get_languages: () => { [key: string]: string };

    // RPC call
    call: (options: DeskCallOptions) => Promise<any>;
    xcall: (options: DeskCallOptions) => Promise<any>;

    // Formatters
    format: (value: any, df: any, options?: any, doc?: any) => string;
    get_formatter: (fieldtype?: string) => Function;
    get_format_helper: (doc: any) => any;

    // Expression evaluation
    evaluate_depends_on: (
      expression: string | undefined | null,
      doc: any,
    ) => boolean;

    // Resource (HTTP)
    resource: {
      call: (options: DeskCallOptions) => Promise<any>;
      buildUrl: (base: string, params?: Record<string, any>) => string;
      freeze: (message?: string) => void;
      unfreeze: () => void;
    };
  }

  var desk: Desk;
  var dash: any;
  var locals: Locals;
  var cstr: Datatype["cstr"];
  var strip_number_groups: Datatype["strip_number_groups"];
  var get_number_format_info: Datatype["get_number_format_info"];
  var convert_old_to_new_number_format: (
    v: string,
    old_number_format?: string,
    new_number_format?: string,
  ) => string;
  var format_number: Datatype["format_number"];
  var format_currency: Datatype["format_currency"];
  var get_currency_symbol: Datatype["get_currency_symbol"];
  var get_number_format: Datatype["get_number_format"];
  var get_number_format_info: Datatype["get_number_format_info"];
  var _round: Datatype["_round"];
  var roundNumber: Datatype["roundNumber"];
  var precision: Datatype["precision"];
  var in_list: Datatype["in_list"];
  var remainder: Datatype["remainder"];
  var round_based_on_smallest_currency_fraction: Datatype["round_based_on_smallest_currency_fraction"];
  var flt: Datatype["flt"];
  var cint: Datatype["cint"];
  var toTitle: Datatype["toTitle"];
  var is_null: Datatype["is_null"];
  var copy_dict: Datatype["copy_dict"];
  var repl: Datatype["repl"];
  var replace_all: Datatype["replace_all"];
  var strip_html: Datatype["strip_html"];
  var strip: Datatype["strip"];
  var lstrip: Datatype["lstrip"];
  var rstrip: Datatype["rstrip"];
  var validate_email: Datatype["validate_email"];
  var validate_phone: Datatype["validate_phone"];
  var validate_name: Datatype["validate_name"];
  var validate_url: Datatype["validate_url"];
  var nth: Datatype["nth"];
  var has_words: Datatype["has_words"];
  var has_common: Datatype["has_common"];
  var defineForm: (doctype: string, handlers: any) => void;
  var defineList: (doctype: string, handlers: any) => void;
  var __n: (
    singular: string,
    plural: string,
    count: number,
    replace?: Record<string, any>,
  ) => string;

  interface Window extends Datatype {
    desk: Desk;
    dash: any;
    __: (text: string, ...args: any[]) => string;
    __n: (
      singular: string,
      plural: string,
      count: number,
      replace?: Record<string, any>,
    ) => string;
    defineForm: (doctype: string, handlers: any) => void;
    defineList: (doctype: string, handlers: any) => void;
    format: (message: string, ...args: any[]) => string;
  }
}
