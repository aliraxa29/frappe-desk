import dayjs from "dayjs";
import { defaults } from "./defaults";

export interface DateTimeUtils {
  convert_to_user_tz: (
    date: string | Date,
    format?: boolean,
  ) => string | dayjs.Dayjs;
  convert_to_system_tz: (
    date: string | Date,
    format?: boolean,
  ) => string | dayjs.Dayjs;
  is_system_time_zone: () => boolean;
  is_timezone_same: () => boolean;
  str_to_obj: (d: string | Date) => Date;
  obj_to_str: (d: string | Date) => string;
  obj_to_user: (d: string | Date) => string;
  get_diff: (d1: string | Date, d2: string | Date) => number;
  get_hour_diff: (d1: string | Date, d2: string | Date) => number;
  get_minute_diff: (d1: string | Date, d2: string | Date) => number;
  get_day_diff: (d1: string | Date, d2: string | Date) => number;
  add_days: (d: string | Date, days: number) => string;
  add_months: (d: string | Date, months: number) => string;
  week_start: () => string;
  week_end: () => string;
  month_start: () => string;
  month_end: () => string;
  quarter_start: () => string;
  quarter_end: () => string;
  year_start: () => string;
  year_end: () => string;
  get_user_time_fmt: () => string;
  get_user_date_fmt: () => string;
  get_user_fmt: () => string;
  str_to_user: (
    val: string,
    only_time?: boolean,
    only_date?: boolean,
  ) => string;
  get_datetime_as_string: (d: string | Date) => string;
  user_to_str: (val: string, only_time?: boolean) => string;
  user_to_obj: (d: string) => Date;
  global_date_format: (d: string) => string;
  now_date: (as_obj?: boolean) => string | Date;
  now_time: (as_obj?: boolean) => string | Date;
  now_datetime: (as_obj?: boolean) => string | Date;
  system_datetime: (as_obj?: boolean) => string | Date;
  get_today: () => string | Date;
  get_time: (timestamp: string) => string;
  validate: (d: string) => boolean;
  get_first_day_of_the_week_index: () => number;
}

export const datetime = {
  convert_to_user_tz: function (date: string | Date, format: boolean = true) {
    // format defaults to true
    // Converts the datetime string to system time zone first since the database only stores datetime in
    // system time zone and then convert the string to user time zone(from User doctype).
    let date_obj = null;
    if (
      window.dash.boot.time_zone &&
      window.dash.boot.time_zone.system &&
      window.dash.boot.time_zone.user
    ) {
      date_obj = dayjs
        .tz(date, window.dash.boot.time_zone.system)
        .clone()
        .tz(window.dash.boot.time_zone.user);
    } else {
      date_obj = dayjs(date);
    }

    return format === false
      ? date_obj
      : date_obj.format(desk.defaultDatetimeFormat);
  },

  convert_to_system_tz: function (date: string | Date, format: boolean = true) {
    // format defaults to true
    // Converts the datetime string to user time zone (from User doctype) first since this fn is called in datetime which accepts datetime
    // in user time zone then convert the string to user time zone.
    // This is done so that only one timezone is present in database and we do not end up storing local timezone since it changes
    // as per the location of user.
    let date_obj = null;
    if (
      window.dash.boot.time_zone &&
      window.dash.boot.time_zone.system &&
      window.dash.boot.time_zone.user
    ) {
      date_obj = dayjs
        .tz(date, window.dash.boot.time_zone.user)
        .clone()
        .tz(window.dash.boot.time_zone.system);
    } else {
      date_obj = dayjs(date);
    }

    return format === false
      ? date_obj
      : date_obj.format(desk.defaultDatetimeFormat);
  },

  is_system_time_zone: function () {
    if (
      window.dash.boot.time_zone &&
      window.dash.boot.time_zone.system &&
      desk.boot.time_zone.user
    ) {
      return (
        dayjs().tz(window.dash.boot.time_zone.system).utcOffset() ===
        dayjs().tz(desk.boot.time_zone.user).utcOffset()
      );
    }

    return true;
  },

  is_timezone_same: function () {
    return this.is_system_time_zone();
  },

  str_to_obj: function (d: string | Date) {
    return dayjs(d, desk.defaultDatetimeFormat).toDate();
  },

  obj_to_str: function (d: string | Date) {
    return dayjs(d).locale("en").format();
  },

  obj_to_user: function (d: string | Date) {
    return dayjs(d).format(this.get_user_date_fmt().toUpperCase());
  },

  get_diff: function (d1: string | Date, d2: string | Date) {
    return dayjs(d1).diff(d2, "days");
  },

  get_hour_diff: function (d1: string | Date, d2: string | Date) {
    return dayjs(d1).diff(d2, "hours");
  },

  get_minute_diff: function (d1: string | Date, d2: string | Date) {
    return dayjs(d1).diff(d2, "minutes");
  },

  get_day_diff: function (d1: string | Date, d2: string | Date) {
    return dayjs(d1).diff(d2, "days");
  },

  add_days: function (d: string | Date, days: number) {
    return dayjs(d).add(days, "days").format();
  },

  add_months: function (d: string | Date, months: number) {
    return dayjs(d).add(months, "months").format();
  },

  week_start: function () {
    return dayjs().startOf("week").format();
  },

  week_end: function () {
    return dayjs().endOf("week").format();
  },

  month_start: function () {
    return dayjs().startOf("month").format();
  },

  month_end: function () {
    return dayjs().endOf("month").format();
  },

  quarter_start: function () {
    return dayjs().startOf("quarter").format();
  },

  quarter_end: function () {
    return dayjs().endOf("quarter").format();
  },

  year_start: function () {
    return dayjs().startOf("year").format();
  },

  year_end: function () {
    return dayjs().endOf("year").format();
  },

  get_user_time_fmt: function () {
    return (desk.sys_defaults && desk.sys_defaults.time_format) || "HH:mm:ss";
  },

  get_user_date_fmt: function () {
    return (desk.sys_defaults && desk.sys_defaults.date_format) || "yyyy-mm-dd";
  },

  get_user_fmt: function () {
    // For backwards compatibility only
    return (desk.sys_defaults && desk.sys_defaults.date_format) || "yyyy-mm-dd";
  },

  /**
   * Converts a datetime string from system format to user format.
   *
   * If a full datetime string is provided, it is assumed to be in the system
   * timezone and converted to the user's timezone.
   *
   * @param {string} val - The datetime string to convert
   * @param {boolean} only_time - If true, parses and returns a time string only
   * @param {boolean} only_date - If true, parses and returns a date string only
   * @returns {string} The datetime string in user format
   */
  str_to_user: function (val: string, only_time = false, only_date = false) {
    if (!val) {
      return "";
    }

    const user_date_fmt = this.get_user_date_fmt().toUpperCase();
    const user_time_fmt = this.get_user_time_fmt();

    if (only_time) {
      let date_obj = dayjs(val, desk.defaultTimeFormat);
      return date_obj.format(user_time_fmt);
    } else if (
      only_date ||
      (typeof val === "string" && val.indexOf(" ") === -1)
    ) {
      let date_obj = dayjs(val, desk.defaultDateFormat);
      return date_obj.format(user_date_fmt);
    } else {
      const system_datetime = dayjs.tz(
        val,
        desk.defaultDatetimeFormat,
        window.dash.boot.time_zone.system,
      );
      const user_datetime = system_datetime
        .clone()
        .tz(window.dash.boot.time_zone.user);

      return user_datetime.format(user_date_fmt + " " + user_time_fmt);
    }
  },

  get_datetime_as_string: function (d: string | Date) {
    return dayjs(d).format("YYYY-MM-DD HH:mm:ss");
  },

  user_to_str: function (val: string, only_time = false) {
    var user_time_fmt = this.get_user_time_fmt();
    if (only_time) {
      return dayjs(val, user_time_fmt).format(desk.defaultTimeFormat);
    }

    var user_fmt = this.get_user_date_fmt().toUpperCase();
    var system_fmt = "YYYY-MM-DD";

    if (val.indexOf(" ") !== -1) {
      user_fmt += " " + user_time_fmt;
      system_fmt += " HH:mm:ss";
    }

    return dayjs(val, [user_fmt.replace("YYYY", "YY"), user_fmt])
      .locale("en")
      .format(system_fmt);
  },

  user_to_obj: function (d: string) {
    return this.str_to_obj(this.user_to_str(d));
  },

  global_date_format(d: string) {
    if (!d) return "";

    const dateStr = String(d).trim();

    const hasTime = /\d{2}:\d{2}(:\d{2})?/.test(dateStr);

    const parsed = dayjs(dateStr);

    if (!parsed.isValid()) return dateStr;

    if (hasTime) {
      return parsed.format("Do MMMM YYYY, hh:mm A");
    } else {
      return parsed.format("Do MMMM YYYY");
    }
  },

  now_date: function (as_obj = false) {
    return this._date(desk.defaultDateFormat, as_obj);
  },

  now_time: function (as_obj = false) {
    return this._date(desk.defaultTimeFormat, as_obj);
  },

  now_datetime: function (as_obj = false) {
    return this._date(desk.defaultDatetimeFormat, as_obj);
  },

  system_datetime: function (as_obj = false) {
    return this._date(desk.defaultDatetimeFormat, as_obj, true);
  },

  _date: function (format: string, as_obj = false, system_time = false) {
    let time_zone =
      window.dash.boot.time_zone?.system || dash.sys_defaults.time_zone;

    // Whenever we are getting now_date/datetime, always make sure dates are fetched using user time zone.
    // This is to make sure that time is as per user time zone set in User doctype, If a user had to change the timezone,
    // we will end up having multiple timezone by not honouring timezone in User doctype.
    // This will make sure that at any point we know which timezone the user if following and not have random timezone
    // when the timezone of the local machine changes.
    if (!system_time) {
      time_zone = window.dash.boot.time_zone?.user || time_zone;
    }
    let date = dayjs.tz(time_zone);

    return as_obj ? this.moment_to_date_obj(date) : date.format(format);
  },

  moment_to_date_obj: function (moment_obj: any) {
    const date_obj = new Date();
    const date_array = moment_obj.toArray();
    date_obj.setFullYear(date_array[0]);
    date_obj.setMonth(date_array[1]);
    date_obj.setDate(date_array[2]);
    date_obj.setHours(date_array[3]);
    date_obj.setMinutes(date_array[4]);
    date_obj.setSeconds(date_array[5]);
    date_obj.setMilliseconds(date_array[6]);
    return date_obj;
  },

  nowdate: function () {
    return this.now_date();
  },

  get_today: function () {
    return this.now_date();
  },

  get_time: (timestamp: string) => {
    // return time with AM/PM
    return dayjs(timestamp).format("hh:mm A");
  },

  validate: function (d: string) {
    return dayjs(
      d,
      [
        desk.defaultDateFormat,
        desk.defaultDatetimeFormat,
        desk.defaultTimeFormat,
      ],
      true,
    ).isValid();
  },

  get_first_day_of_the_week_index() {
    const first_day_of_the_week =
      defaults.get_user_default("first_day_of_the_week") || "Sunday";
    return dayjs().day(first_day_of_the_week).day();
  },
};
