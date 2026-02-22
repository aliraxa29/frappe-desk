import { __ } from "./translate";

export interface User {
  name: string;
  full_name: (uid: string) => string;
  image: (uid: string) => string;
  abbr: (uid: string) => string;
  has_role: (rl: string | string[]) => boolean | undefined;
  get_full_name: () => string;
  get_user_full_name: () => string;
  get_user_image: () => string;
  get_email: () => string;
  user_info: (uid: string) => Record<string, any>;
  update_user_info: (user_info: Record<string, any>) => void;
  is_report_manager: () => boolean | undefined;
  get_formatted_email: (email: string) => string;
  get_emails: () => string[];
  toString: () => string;
}

export const user: User = {
  name: "Guest",

  full_name: (uid: string) => {
    return uid === desk.session.user
      ? __(
          "You",
          undefined,
          "Name of the current user. For example: You edited this 5 hours ago.",
        )
      : user.user_info(uid).fullname;
  },
  image: (uid: string) => {
    return user.user_info(uid).image;
  },
  abbr: (uid: string) => {
    return user.user_info(uid).abbr;
  },

  has_role: (rl: string | string[]) => {
    if (typeof rl == "string") rl = [rl];
    for (var i in rl) {
      if ((dash.boot ? dash.boot.user.roles : ["Guest"]).indexOf(rl[i]) != -1)
        return true;
    }
  },

  get_full_name: (): string => {
    return user.get_user_full_name();
  },

  get_user_full_name: (): string => {
    const boot = (window as any).dash?.boot;
    const bootUser = boot?.user;
    if (!bootUser) return "";

    // Try user_info first (has precomputed fullname), then fall back to user fields
    const userInfo = boot?.user_info?.[bootUser.name];
    if (userInfo?.fullname) return String(userInfo.fullname).trim();

    const fullName = String(bootUser.full_name || "").trim();
    if (fullName) return fullName;

    const firstName = String(bootUser.first_name || "").trim();
    const lastName = String(bootUser.last_name || "").trim();
    return `${firstName} ${lastName}`.trim();
  },

  get_user_image: (): string => {
    const boot = (window as any).dash?.boot;
    const bootUser = boot?.user;
    // Try user_info first (has image), then fall back
    const userInfo = boot?.user_info?.[bootUser?.name];
    return String(userInfo?.image || bootUser?.user_image || "").trim();
  },

  get_email: (): string => {
    const bootUser = (window as any).dash?.boot?.user;
    return String(bootUser?.email || "").trim();
  },

  user_info: (uid: string) => {
    if (!uid) uid = desk.session.user;

    let user_info;
    if (!(dash.boot.user_info && dash.boot.user_info[uid])) {
      user_info = { fullname: uid || "Unknown" };
    } else {
      user_info = dash.boot.user_info[uid];
    }

    user_info.abbr = desk.utils.get_abbr(user_info.fullname);

    return user_info;
  },

  update_user_info: (user_info: Record<string, any>) => {
    for (let user in user_info) {
      if (dash.boot.user_info[user]) {
        Object.assign(dash.boot.user_info[user], user_info[user]);
      } else {
        dash.boot.user_info[user] = user_info[user];
      }
    }
  },

  is_report_manager: () => {
    return desk.user.has_role([
      "Administrator",
      "System Manager",
      "Report Manager",
    ]);
  },

  get_formatted_email: (email: string) => {
    var fullname = desk.user.full_name(email);

    if (!fullname) {
      return email;
    } else {
      // to quote or to not
      var quote = "";

      // only if these special characters are found
      // why? To make the output same as that in python!
      if (fullname.search(/[\[\]\\()<>@,:;".]/) !== -1) {
        quote = '"';
      }

      return repl("%(quote)s%(fullname)s%(quote)s <%(email)s>", {
        fullname: fullname,
        email: email,
        quote: quote,
      });
    }
  },

  get_emails: () => {
    return Object.keys(dash.boot.user_info).map(
      (key) => dash.boot.user_info[key].email,
    );
  },

  /* Normally dash.user is an object
   * having properties and methods.
   * But in the following case
   *
   * if (dash.user === 'Administrator')
   *
   * dash.user will cast to a string
   * returning dash.user.name
   */
  toString: () => {
    return user.name;
  },
};
