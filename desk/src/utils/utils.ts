import { toast } from "@/stores/toast";
import { __ } from "./translate";
import numbers_system from "./numbers_system";

export interface BaseUtils {
  get_random: (len: number) => string;
  get_file_link: (filename: string) => string;
  replace_newlines: (t: string) => string;
  is_html: (txt: string) => boolean;
  is_mac: () => boolean;
  is_xs: () => boolean;
  is_sm: () => boolean;
  is_md: () => boolean;
  is_json: (str: string) => boolean;
  parse_json: (str: string) => any;
  strip_whitespace: (html: string) => string;
  encode_tags: (html: string) => string;
  strip_original_content: (txt: string) => string;
  escape_html: (txt: string) => string;
  unescape_html: (txt: string) => string;
  html2text: (html: string) => string;
  is_url: (txt: string) => boolean;
  to_title_case: (string: string, with_space?: boolean) => string;
  scroll_to: (
    element: HTMLElement | number | null,
    animate?: boolean,
    additionalOffset?: number,
    scrollContainer?: HTMLElement | null,
    callback?: () => void,
    highlight?: boolean,
  ) => void;
  get_scroll_position: (
    element: HTMLElement,
    additionalOffset?: number,
  ) => number;
  isVisible: (element: HTMLElement | null) => boolean;
  filter_dict: (dict: any, filters: any) => any[];
  comma_or: (list: any[]) => string;
  comma_and: (list: any[]) => string;
  comma_sep: (list: any[], sep: string) => string;
  get_args_dict_from_url: (txt: string) => { [key: string]: string };
  get_url_from_dict: (args: { [key: string]: string }) => string;
  validate_type: (val: string, type: string) => boolean;
  guess_style: (
    text: string,
    default_style?: string,
    _colour?: boolean,
  ) => string;
  guess_colour: (text: string) => string;
  get_indicator_color: (state: string) => Promise<string>;
  sort: (
    list: any[],
    key: string,
    compare_type?: string,
    reverse?: boolean,
  ) => any[];
  unique: (list: any[]) => any[];
  remove_nulls: (list: any[]) => any[];
  all: (lst: any[]) => boolean;
  dict: (keys: string[], values: any[][]) => any[];
  sum: (list: any[]) => number;
  arrays_equal: (arr1: any[], arr2: any[]) => boolean;
  intersection: (a: any[], b: any[]) => any[];
  resize_image: (
    reader: any,
    callback: (dataURL: string) => void,
    max_width?: number,
    max_height?: number,
  ) => void;
  csv_to_array: (strData: string, strDelimiter?: string) => string[][];
  is_image_file: (filename: string) => boolean;
  is_video_file: (filename: string) => boolean;
  play_sound: (name: string) => void;
  split_emails: (txt: string) => string[];
  report_column_total: (values: any[], column: any, type: string) => number;
  file_name_ellipsis: (filename: string, length: number) => string;
  get_decoded_string: (dataURI: string) => string;
  copy_to_clipboard: (string: string) => void;
  is_rtl: (lang: string | null) => boolean;
  eval: (code: string, context: any) => any;
  get_browser: () => { name: string; version: string };
  get_formatted_duration: (value: number, duration_options: any) => string;
  get_formatted_iban: (value: string) => string;
  seconds_to_duration: (
    seconds: number,
    duration_options: any,
  ) => { days: number; hours: number; minutes: number; seconds: number };
  duration_to_seconds: (
    days: number,
    hours: number,
    minutes: number,
    seconds: number,
  ) => number;
  get_duration_options: (docfield: any) => any;
  get_number_system: (country: string) => any;
  flag: (country_code: string) => string;
  shorten_number: (
    number: number,
    country: string,
    min_length: number,
    max_no_of_decimals: number,
  ) => string;
  get_number_of_decimals: (number: number) => number;
  get_clipboard_data: (clipboard_paste_event: any) => any;
  sleep: (time: number) => Promise<void>;
  parse_array: (array: any[]) => any;
  range: (start: number, end?: number) => number[];
  string_to_boolean: (string: string) => boolean | string;
  get_filter_as_json: (filters: any[]) => string | null;
  process_filter_expression: (filter: string) => any;
  get_filter_from_json: (filter_json: string, doctype: string) => any;
  is_current_user: (user: string) => boolean;
  mask_passwords: (obj: Record<string, any>) => void;
}

export const utils: BaseUtils = {
  get_random: (len: number) => {
    let text = "";
    let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  },
  get_file_link: (filename: string) => {
    filename = cstr(filename);
    if (utils.is_url(filename)) {
      return filename;
    } else if (filename.indexOf("/") === -1) {
      return "files/" + filename;
    } else {
      return filename;
    }
  },
  replace_newlines: (t: string) => {
    return t ? t.replace(/\n/g, "<br>") : "";
  },
  is_html: (txt: string) => {
    if (!txt) return false;

    const doc = new DOMParser().parseFromString(txt, "text/html");
    const nodes = doc.body.childNodes || [];

    // check if any of the nodes are element nodes
    // Ref: https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType
    return [...nodes].some((node) => node.nodeType === 1);
  },
  is_mac: () => {
    return window.navigator.platform === "MacIntel";
  },
  is_xs: () => {
    return window.innerWidth < 768;
  },
  is_sm: () => {
    return window.innerWidth < 991 && window.innerWidth >= 768;
  },
  is_md: () => {
    return window.innerWidth < 1199 && window.innerWidth >= 991;
  },
  is_json: (str: string) => {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  },
  parse_json: (str: string) => {
    let parsed_json = "";
    try {
      parsed_json = JSON.parse(str);
    } catch (e) {
      return str;
    }
    return parsed_json;
  },
  strip_whitespace: (html: string) => {
    return (html || "")
      .replace(/<p>\s*<\/p>/g, "")
      .replace(/<br>(\s*<br>\s*)+/g, "<br><br>");
  },
  encode_tags: (html: string) => {
    let tagsToReplace: { [key: string]: string } = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
    };

    function replaceTag(tag: string) {
      return tagsToReplace[tag] || tag;
    }

    return html.replace(/[&<>]/g, replaceTag);
  },
  strip_original_content: (txt: string) => {
    let out: string[] = [],
      part: string[] = [],
      newline = txt.indexOf("<br>") === -1 ? "\n" : "<br>";

    txt.split(newline).forEach(function (i, t) {
      let tt = strip(i);
      if (tt && (tt.substring(0, 1) === ">" || tt.substring(0, 4) === "&gt;")) {
        part.push(i);
      } else {
        out = out.concat(part);
        out.push(i);
        part = [];
      }
    });
    return out.join(newline);
  },
  escape_html: (txt: string) => {
    if (!txt) return "";
    let escape_html_mapping: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
      "`": "&#x60;",
      "=": "&#x3D;",
    };

    return String(txt).replace(
      /[&<>"'`=]/g,
      (char) => escape_html_mapping[char] || char,
    );
  },
  unescape_html: (txt: string) => {
    let unescape_html_mapping: Record<string, string> = {
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&#x60;": "`",
      "&#x3D;": "=",
    };

    return String(txt).replace(
      /&amp;|&lt;|&gt;|&quot;|&#39;|&#x60;|&#x3D;/g,
      (char) => unescape_html_mapping[char] || char,
    );
  },
  html2text: (html: string) => {
    const parser = new DOMParser();
    const dom = parser.parseFromString(html, "text/html");
    return dom.body.textContent || "";
  },
  is_url: (txt: string) => {
    return (
      txt.toLowerCase().substring(0, 7) == "http://" ||
      txt.toLowerCase().substring(0, 8) == "https://"
    );
  },
  to_title_case: (string: string, with_space = false) => {
    let titlecased_string = string
      .toLowerCase()
      .replace(/(?:^|[\s-/])\w/g, function (match) {
        return match.toUpperCase();
      });

    let replace_with = with_space ? " " : "";

    return titlecased_string.replace(/-|_/g, replace_with);
  },
  scroll_to: (
    element: HTMLElement | number | null,
    animate = true,
    additionalOffset = 0,
    scrollContainer: HTMLElement | null = null,
    callback?: () => void,
    highlight = false,
  ) => {
    const container = scrollContainer || document.documentElement;

    let scrollTop = 0;

    if (element) {
      if (typeof element === "number") {
        scrollTop = element - cint(additionalOffset);
      } else {
        scrollTop = utils.get_scroll_position(element, additionalOffset);
      }
    }

    scrollTop = Math.max(0, scrollTop);

    const highlightElement = () => {
      if (!highlight || typeof element === "number" || !element) return;

      element.classList.add("highlight");

      document.addEventListener(
        "click",
        () => {
          element.classList.remove("highlight");
        },
        { once: true },
      );
    };

    // Already at position
    if (scrollTop === container.scrollTop) {
      highlightElement();
      return;
    }

    if (animate) {
      container.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });

      const onScrollEnd = () => {
        highlightElement();
        callback?.();
        container.removeEventListener("scrollend", onScrollEnd);
      };

      container.addEventListener("scrollend", onScrollEnd);
    } else {
      container.scrollTop = scrollTop;
      highlightElement();
      callback?.();
    }
  },
  get_scroll_position: (
    element: HTMLElement,
    additionalOffset: number = 0,
  ): number => {
    const navbar = document.querySelector(".navbar") as HTMLElement;
    const pageHead = document.querySelector(".page-head") as HTMLElement;

    const navbarHeight = navbar?.offsetHeight || 0;
    const pageHeadHeight = pageHead?.offsetHeight || 0;

    const headerOffset =
      navbarHeight + (utils.isVisible(pageHead) ? pageHeadHeight : 0);

    const elementTop = element.getBoundingClientRect().top + window.scrollY;

    return elementTop - headerOffset - cint(additionalOffset);
  },
  isVisible: (element: HTMLElement | null): boolean => {
    if (!element) return false;

    return (
      element.offsetParent !== null &&
      getComputedStyle(element).display !== "none" &&
      getComputedStyle(element).visibility !== "hidden"
    );
  },
  filter_dict: (dict: any, filters: any) => {
    let ret: any[] = [];
    if (typeof filters == "string") {
      return [dict[filters]];
    }
    Object.keys(dict).forEach(function (key) {
      const d = dict[key];
      for (let filterKey in filters) {
        if (Array.isArray(filters[filterKey])) {
          if (filters[filterKey][0] == "in") {
            if (filters[filterKey][1].indexOf(d[filterKey]) == -1) return;
          } else if (filters[filterKey][0] == "not in") {
            if (filters[filterKey][1].indexOf(d[filterKey]) != -1) return;
          } else if (filters[filterKey][0] == "<") {
            if (!(d[filterKey] < filters[filterKey][1])) return;
          } else if (filters[filterKey][0] == "<=") {
            if (!(d[filterKey] <= filters[filterKey][1])) return;
          } else if (filters[filterKey][0] == ">") {
            if (!(d[filterKey] > filters[filterKey][1])) return;
          } else if (filters[filterKey][0] == ">=") {
            if (!(d[filterKey] >= filters[filterKey][1])) return;
          }
        } else {
          if (d[filterKey] != filters[filterKey]) return;
        }
      }
      ret.push(d);
    });
    return ret;
  },
  comma_or: (list: any[]) => {
    return utils.comma_sep(list, " " + __("or") + " ");
  },
  comma_and: (list: any[]) => {
    return utils.comma_sep(list, " " + __("and") + " ");
  },
  comma_sep: (list: any[], sep: string) => {
    if (list instanceof Array) {
      if (list.length == 0) {
        return "";
      } else if (list.length == 1) {
        return list[0];
      } else {
        return (
          list.slice(0, list.length - 1).join(", ") + sep + list.slice(-1)[0]
        );
      }
    } else {
      return list;
    }
  },
  get_args_dict_from_url: (txt: string) => {
    let args: { [key: string]: string } = {};
    decodeURIComponent(txt)
      .split("&")
      .forEach(function (arg) {
        const _arg = arg.split("=");
        args[_arg[0]] = _arg[1];
      });
    return args;
  },
  get_url_from_dict: (args: { [key: string]: string }) => {
    return (
      Object.keys(args)
        .map((key) => {
          const val = args[key];
          if (val !== null)
            return encodeURIComponent(key) + "=" + encodeURIComponent(val);
          else return null;
        })
        .join("&") || ""
    );
  },
  validate_type: (val: string, type: string) => {
    // from https://github.com/guillaumepotier/Parsley.js/blob/master/parsley.js#L81
    let regExp;

    switch (type) {
      case "phone":
        regExp = /^([0-9 +_\-,.*#()]){1,20}$/;
        break;
      case "name":
        regExp = /^[\w][\w'-]*([ \w][\w'-]+)*$/;
        break;
      case "number":
        regExp = /^-?(?:\d+|\d{1,3}(?:,\d{3})+)?(?:\.\d+)?$/;
        break;
      case "digits":
        regExp = /^\d+$/;
        break;
      case "alphanum":
        regExp = /^\w+$/;
        break;
      case "email":
        // from https://emailregex.com/
        regExp =
          /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        break;
      case "url":
        regExp =
          /^((([A-Za-z0-9.+-]+:(?:\/\/)?)(?:[-;:&=\+\,\w]@)?[A-Za-z0-9.-]+(:[0-9]+)?|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)$/i; // eslint-disable-line
        break;
      case "dateIso":
        regExp = /^(\d{4})\D?(0[1-9]|1[0-2])\D?([12]\d|0[1-9]|3[01])$/;
        break;
      default:
        return false;
    }

    // test regExp if not null
    return "" !== val ? regExp.test(val) : false;
  },
  guess_style: (text: string, default_style?: string, _colour?: boolean) => {
    let style = default_style || "default";
    let colour = "gray";
    if (text) {
      text = cstr(text);
      if (has_words(["Pending", "Review", "Medium", "Not Approved"], text)) {
        style = "warning";
        colour = "orange";
      } else if (
        has_words(
          ["Open", "Urgent", "High", "Failed", "Rejected", "Error"],
          text,
        )
      ) {
        style = "danger";
        colour = "red";
      } else if (
        has_words(
          [
            "Closed",
            "Finished",
            "Converted",
            "Completed",
            "Complete",
            "Confirmed",
            "Approved",
            "Yes",
            "Active",
            "Available",
            "Paid",
            "Success",
          ],
          text,
        )
      ) {
        style = "success";
        colour = "green";
      } else if (has_words(["Submitted"], text)) {
        style = "info";
        colour = "blue";
      }
    }
    return _colour ? colour : style;
  },
  guess_colour: (text: string) => {
    return utils.guess_style(text, undefined, true);
  },
  get_indicator_color: (state: string) => {
    return desk.db
      .get_list("Workflow State", {
        filters: { name: state },
        fields: ["name", "style"],
      })
      .then((res) => {
        const state = res[0];
        if (!state.style) {
          return utils.guess_colour(state.name);
        }
        const style = state.style;
        const colour_map: Record<string, string> = {
          Success: "green",
          Warning: "orange",
          Danger: "red",
          Primary: "blue",
        };

        return colour_map[style];
      });
  },
  sort: (
    list: any[],
    key: string,
    compare_type?: string,
    reverse?: boolean,
  ) => {
    if (!list || list.length < 2) return list || [];

    let sort_fn: Record<string, (a: any, b: any) => number> = {
      string: function (a: any, b: any) {
        return cstr(a[key]).localeCompare(cstr(b[key]));
      },
      number: function (a: any, b: any) {
        return flt(a[key]) - flt(b[key]);
      },
    };

    if (!compare_type)
      compare_type = typeof list[0][key] === "string" ? "string" : "number";

    list.sort(sort_fn[compare_type]);

    if (reverse) {
      list.reverse();
    }

    return list;
  },
  unique: (list: any[]) => {
    let dict: { [key: string]: null } = {},
      arr: any[] = [];
    for (let i = 0, l = list.length; i < l; i++) {
      if (!(list[i] in dict)) {
        dict[list[i]] = null;
        arr.push(list[i]);
      }
    }
    return arr;
  },
  remove_nulls: (list: any[]) => {
    let new_list: any[] = [];
    for (let i = 0, l = list.length; i < l; i++) {
      if (!is_null(list[i])) {
        new_list.push(list[i]);
      }
    }
    return new_list;
  },
  all: (lst: any[]) => {
    for (let i = 0, l = lst.length; i < l; i++) {
      if (!lst[i]) {
        return false;
      }
    }
    return true;
  },
  dict: (keys: string[], values: any[][]) => {
    // make dictionaries from keys and values
    let out: any[] = [];
    values.forEach(function (row) {
      let new_row: { [key: string]: any } = {};
      keys.forEach(function (key, key_idx) {
        new_row[key] = row[key_idx];
      });
      out.push(new_row);
    });
    return out;
  },
  sum: (list: any[]) => {
    return list.reduce((previous_value, current_value) => {
      return flt(previous_value) + flt(current_value);
    }, 0.0);
  },
  arrays_equal: (arr1: any[], arr2: any[]) => {
    if (!arr1 || !arr2) {
      return false;
    }
    if (arr1.length != arr2.length) {
      return false;
    }
    for (let i = 0; i < arr1.length; i++) {
      if (Array.isArray(arr1[i])) {
        if (!utils.arrays_equal(arr1[i], arr2[i])) {
          return false;
        }
      } else if (arr1[i] !== arr2[i]) {
        return false;
      }
    }
    return true;
  },
  intersection: (a: any[], b: any[]) => {
    // from stackoverflow: http://stackoverflow.com/questions/1885557/simplest-code-for-array-intersection-in-javascript
    /* finds the intersection of
     * two arrays in a simple fashion.
     *
     * PARAMS
     *  a - first array, must already be sorted
     *  b - second array, must already be sorted
     *
     * NOTES
     *
     *  Should have O(n) operations, where n is
     *    n = MIN(a.length(), b.length())
     */
    let ai = 0,
      bi = 0;
    let result = new Array();

    // sorted copies
    a = Array.isArray(a) ? a.sort() : [];
    b = Array.isArray(b) ? b.sort() : [];

    while (ai < a.length && bi < b.length) {
      if (a[ai] < b[bi]) {
        ai++;
      } else if (a[ai] > b[bi]) {
        bi++;
      } else {
        /* they're equal */
        result.push(a[ai]);
        ai++;
        bi++;
      }
    }

    return result;
  },
  resize_image: (
    reader: any,
    callback: (dataURL: string) => void,
    max_width?: number,
    max_height?: number,
  ) => {
    let tempImg = new Image();
    if (!max_width) max_width = 600;
    if (!max_height) max_height = 400;
    tempImg.src = reader.result;

    tempImg.onload = function () {
      let tempW = tempImg.width;
      let tempH = tempImg.height;
      if (tempW > tempH) {
        if (tempW > max_width) {
          tempH *= max_width / tempW;
          tempW = max_width;
        }
      } else {
        if (tempH > max_height) {
          tempW *= max_height / tempH;
          tempH = max_height;
        }
      }

      let canvas = document.createElement("canvas");
      canvas.width = tempW;
      canvas.height = tempH;
      let ctx = canvas.getContext("2d");
      ctx?.drawImage(tempImg, 0, 0, tempW, tempH);
      let dataURL = canvas.toDataURL("image/jpeg");
      setTimeout(function () {
        callback(dataURL);
      }, 10);
    };
  },

  csv_to_array: (strData: string, strDelimiter?: string) => {
    // Check to see if the delimiter is defined. If not,
    // then default to comma.
    strDelimiter = strDelimiter || ",";

    // Create a regular expression to parse the CSV values.
    let objPattern = new RegExp(
      // Delimiters.
      "(\\" +
        strDelimiter +
        "|\\r?\\n|\\r|^)" +
        // Quoted fields.
        '(?:"([^"]*(?:""[^"]*)*)"|' +
        // Standard fields.
        '([^"\\' +
        strDelimiter +
        "\\r\\n]*))",
      "gi",
    );

    // Create an array to hold our data. Give the array
    // a default empty first row.
    let arrData: string[][] = [[]];

    // Create an array to hold our individual pattern
    // matching groups.
    let arrMatches: RegExpExecArray | null = null;

    // Keep looping over the regular expression matches
    // until we can no longer find a match.
    while ((arrMatches = objPattern.exec(strData))) {
      // Get the delimiter that was found.
      let strMatchedDelimiter = arrMatches[1];

      // Check to see if the given delimiter has a length
      // (is not the start of string) and if it matches
      // field delimiter. If id does not, then we know
      // that this delimiter is a row delimiter.
      if (strMatchedDelimiter.length && strMatchedDelimiter !== strDelimiter) {
        // Since we have reached a new row of data,
        // add an empty row to our data array.
        arrData.push([]);
      }

      let strMatchedValue: string;

      // Now that we have our delimiter out of the way,
      // let's check to see which kind of value we
      // captured (quoted or unquoted).
      if (arrMatches[2]) {
        // We found a quoted value. When we capture
        // this value, unescape any double quotes.
        strMatchedValue = arrMatches[2].replace(new RegExp('""', "g"), '"');
      } else {
        // We found a non-quoted value.
        strMatchedValue = arrMatches[3];
      }

      // Now that we have our value string, let's add
      // it to the data array.
      arrData[arrData.length - 1].push(strMatchedValue);
    }

    // Return the parsed data.
    return arrData;
  },

  is_image_file: (filename: string) => {
    if (!filename) return false;
    // url can have query params
    filename = filename.split("?")[0];
    return /\.(gif|jpg|jpeg|tiff|png|svg)$/i.test(filename);
  },

  is_video_file: (filename: string) => {
    if (!filename) return false;
    // url can have query params
    filename = filename.split("?")[0];
    return /\.(mov|mp4|mkv|webm)$/i.test(filename);
  },

  play_sound: (name: string) => {
    try {
      if (dash.boot.user.mute_sounds) {
        return;
      }

      let audio = document.getElementById("sound-" + name) as HTMLAudioElement;
      audio.volume = parseFloat(audio.getAttribute("volume") || "1");
      if (!audio.paused) {
        audio.currentTime = 0;
      }
      audio.play();
    } catch (e) {
      console.log("Cannot play sound", name, e);
      // pass
    }
  },

  split_emails: (txt: string) => {
    let email_list: string[] = [];

    if (!txt) {
      return email_list;
    }

    // emails can be separated by comma or newline
    txt.split(/[,\n](?=(?:[^"]|"[^"]*")*$)/g).forEach(function (email) {
      email = email.trim();
      if (email) {
        email_list.push(email);
      }
    });

    return email_list;
  },

  report_column_total: (values: any[], column: any, type: string) => {
    if (column.column.disable_total) {
      return "";
    } else if (values.length > 0) {
      if (column.column.fieldtype == "Percent" || type === "mean") {
        return values.reduce((a, b) => flt(a) + flt(b)) / values.length;
      } else if (column.column.fieldtype == "Int") {
        return values.reduce((a, b) => cint(a) + cint(b));
      } else if (desk.model.is_numeric_field(column.column.fieldtype)) {
        return values.reduce((a, b) => flt(a) + flt(b));
      } else {
        return null;
      }
    } else {
      return null;
    }
  },

  file_name_ellipsis: (filename: string, length: number) => {
    let first_part_length = (length * 2) / 3;
    let last_part_length = length - first_part_length;
    let parts = filename.split(".");
    let extn = parts.pop();
    let name = parts.join("");
    let first_part = name.slice(0, first_part_length);
    let last_part = name.slice(-last_part_length);
    if (name.length > length) {
      return `${first_part}...${last_part}.${extn}`;
    } else {
      return filename;
    }
  },

  get_decoded_string: (dataURI: string) => {
    // decodes base64 to string
    let parts = dataURI.split(",");
    const encoded_data = parts[1];
    let decoded = atob(encoded_data);
    try {
      const escaped = escape(decoded);
      decoded = decodeURIComponent(escaped);
    } catch (e) {
      // pass decodeURIComponent failure
      // just return atob response
    }
    return decoded;
  },

  copy_to_clipboard: (string: string) => {
    const show_success_alert = () => {
      toast.success(__("Copied to clipboard."));
    };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(string).then(show_success_alert);
    } else {
      let input = document.createElement("textarea");
      document.body.appendChild(input);
      input.value = string;
      input.select();

      document.execCommand("copy");
      show_success_alert();
      input.remove();
    }
  },
  is_rtl: (lang: string | null = null) => {
    return ["ar", "he", "fa", "ps"].includes(lang || dash.boot.lang);
  },

  eval: (code: string, context: any = {}) => {
    let variable_names = Object.keys(context);
    let variables = Object.values(context);
    code = `let out = ${code}; return out`;
    try {
      let expression_function = new Function(...variable_names, code);
      return expression_function(...variables);
    } catch (error) {
      console.log("Error evaluating the following expression:");
      console.error(code);
      throw error;
    }
  },

  get_browser: () => {
    let ua = navigator.userAgent;
    let tem;
    let M =
      ua.match(
        /(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i,
      ) || [];

    if (/trident/i.test(M[1])) {
      tem = /\brv[ :]+(\d+)/g.exec(ua) || [];
      return { name: "IE", version: tem[1] || "" };
    }
    if (M[1] === "Chrome") {
      tem = ua.match(/\bOPR|Edge\/(\d+)/);
      if (tem != null) {
        return { name: "Opera", version: tem[1] };
      }
    }
    M = M[2] ? [M[1], M[2]] : [navigator.appName, navigator.appVersion, "-?"];
    if ((tem = ua.match(/version\/(\d+)/i)) != null) {
      M.splice(1, 1, tem[1]);
    }
    return {
      name: M[0],
      version: M[1],
    };
  },

  get_formatted_duration: (value: number, duration_options: any = null) => {
    let duration = "";
    if (!duration_options) {
      duration_options = {
        hide_days: 0,
        hide_seconds: 0,
      };
    }
    if (value) {
      let total_duration = utils.seconds_to_duration(value, duration_options);

      if (total_duration.days && duration_options.hide_days !== 1) {
        duration += total_duration.days + "Days";
      }
      if (total_duration.hours) {
        duration += duration.length ? " " : "";
        duration += total_duration.hours + "Hours";
      }
      if (total_duration.minutes) {
        duration += duration.length ? " " : "";
        duration += total_duration.minutes + "Minutes";
      }
      if (total_duration.seconds && duration_options.hide_seconds !== 1) {
        duration += duration.length ? " " : "";
        duration += total_duration.seconds + "Seconds";
      }
    }
    return duration;
  },

  get_formatted_iban: (value: string) => {
    if (
      !value ||
      ["BI", "SV", "EG", "LY"].some((country) => value.startsWith(country))
    ) {
      return value;
    }

    return value.replaceAll(" ", "").replace(/(.{4})(?=.)/g, "$1 ");
  },

  seconds_to_duration: (seconds: number, duration_options: any) => {
    const floor = seconds > 0 ? Math.floor : Math.ceil;
    const total_duration = {
      days: floor(seconds / 86400), // 60 * 60 * 24
      hours: floor((seconds % 86400) / 3600),
      minutes: floor((seconds % 3600) / 60),
      seconds: floor(seconds % 60),
    };

    if (duration_options && duration_options.hide_days) {
      total_duration.hours = floor(seconds / 3600);
      total_duration.days = 0;
    }

    if (duration_options && duration_options.hide_seconds) {
      total_duration.minutes += Math.round(total_duration.seconds / 60);
      total_duration.seconds = 0;
    }

    return total_duration;
  },

  duration_to_seconds: (days = 0, hours = 0, minutes = 0, seconds = 0) => {
    let value = 0;
    if (days) {
      value += days * 24 * 60 * 60;
    }
    if (hours) {
      value += hours * 60 * 60;
    }
    if (minutes) {
      value += minutes * 60;
    }
    if (seconds) {
      value += seconds;
    }
    return value;
  },

  get_duration_options: (docfield: any) => {
    return {
      hide_days: docfield.hide_days,
      hide_seconds: docfield.hide_seconds,
    };
  },

  get_number_system: (country: string) => {
    if (["Bangladesh", "India", "Myanmar", "Pakistan"].includes(country)) {
      return numbers_system.indian;
    } else if (country == "Nepal") {
      return numbers_system.nepalese;
    } else {
      return numbers_system.default;
    }
  },

  flag: (country_code: string) => {
    return `<img
    src="https://flagcdn.com/${country_code}.svg"
    width="20" height="15">`;
  },

  shorten_number: (
    number: number,
    country: string,
    min_length: number = 4,
    max_no_of_decimals: number = 2,
  ) => {
    /* returns the number as an abbreviated string
     * PARAMS
     *  number - number to be shortened
     *  country - country that determines the number system to be used
     *  min_length - length below which the number will not be shortened
     *	max_no_of_decimals - max number of decimals of the shortened number
     */

    // return number if total digits is lesser than min_length
    const len = String(number)?.match(/\d/g)?.length;
    if (len && len < min_length) {
      return number.toString();
    }

    const number_system = utils.get_number_system(country);
    let x = Math.abs(Math.round(number));

    // if rounding was sufficient to get below min_length, return the rounded number
    const x_string = x.toString();
    if (x_string.length < min_length) {
      return x_string;
    }

    for (const map of number_system) {
      if (x >= map.divisor) {
        let result = number / map.divisor;
        const no_of_decimals = utils.get_number_of_decimals(result);
        /*
          If no_of_decimals is greater than max_no_of_decimals,
          round the number to max_no_of_decimals
        */
        result =
          no_of_decimals > max_no_of_decimals
            ? flt(result.toFixed(max_no_of_decimals))
            : result;
        return result + " " + map.symbol;
      }
    }

    return flt(number.toFixed(max_no_of_decimals)).toString();
  },

  get_number_of_decimals: (number: number) => {
    if (Math.floor(number) === number) return 0;
    return number?.toString().split(".")[1]?.length || 0;
  },

  get_clipboard_data: (clipboard_paste_event: any) => {
    let e = clipboard_paste_event;
    let clipboard_data = e.clipboardData || e.originalEvent.clipboardData;
    return clipboard_data.getData("Text");
  },

  sleep: (time: number) => {
    return new Promise((resolve) => setTimeout(resolve, time));
  },

  parse_array: (array: any[]) => {
    if (array && array.length !== 0) {
      return array;
    }
    return undefined;
  },

  // simple implementation of python's range
  range: (start: number, end?: number) => {
    if (end === undefined && start !== undefined) {
      end = start;
      start = 0;
    }
    if (!end) {
      end = 0;
    }
    let arr: number[] = [];
    for (let i = start; i < end; i++) {
      arr.push(i);
    }
    return arr;
  },

  string_to_boolean: (string: string) => {
    switch (string.toLowerCase().trim()) {
      case "t":
      case "true":
      case "y":
      case "yes":
      case "1":
        return true;
      case "f":
      case "false":
      case "n":
      case "no":
      case "0":
      case null:
        return false;
      default:
        return string;
    }
  },

  get_filter_as_json: (filters: any[]) => {
    // convert filter array to json
    let filter = null;
    if (filters.length) {
      filter = {};
      filters.forEach((arr) => {
        filter[arr[1]] = [arr[2], arr[3]];
      });
      filter = JSON.stringify(filter);
    }
    return filter;
  },

  process_filter_expression: (filter: string) => {
    return new Function(`return ${filter}`)();
  },

  get_filter_from_json: (filter_json: string, doctype: string) => {
    // convert json to filter array
    if (filter_json) {
      if (!filter_json.length) {
        return [];
      }

      const filters_json = utils.process_filter_expression(filter_json);
      if (!doctype) {
        // e.g. return {
        //    priority: (2) ['=', 'Medium'],
        //    status: (2) ['=', 'Open']
        // }

        // don't remove unless patch is created to convert all existing filters from object to array
        // backward compatibility
        if (Array.isArray(filters_json)) {
          let filter: Record<string, [string, any]> = {};
          filters_json.forEach((arr) => {
            filter[arr[1]] = [arr[2], arr[3]];
          });
          return filter || [];
        }
        return filters_json || [];
      }

      // e.g. return [
      //    ['ToDo', 'status', '=', 'Open', false],
      //    ['ToDo', 'priority', '=', 'Medium', false]
      // ]
      if (Array.isArray(filters_json)) {
        return filters_json;
      }
      // don't remove unless patch is created to convert all existing filters from object to array
      // backward compatibility
      return Object.keys(filters_json).map((filter) => {
        let val = filters_json[filter];
        return [doctype, filter, val[0], val[1], false];
      });
    }
  },

  is_current_user: (user: string) => {
    return user === desk.session.user;
  },

  /**
   * Masks passwords in an object by replacing the values of keys containing
   * "password" or "passphrase" with "*****".
   *
   * @param {Object} obj - The object to mask passwords in.
   */
  mask_passwords: (obj: Record<string, any>) => {
    const KEYWORDS_TO_MASK = ["password", "passphrase"];
    for (const key of Object.keys(obj)) {
      if (
        KEYWORDS_TO_MASK.some((keyword) => key.includes(keyword)) &&
        obj[key]
      ) {
        obj[key] = "*****";
      }
    }
  },
};
