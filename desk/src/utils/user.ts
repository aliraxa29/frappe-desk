export interface User {
  get_full_name(): string;
  get_user_full_name(): string;
  get_user_image(): string;
  get_email(): string;
}

export const user: User = {
  get_full_name(): string {
    return user.get_user_full_name();
  },

  get_user_full_name(): string {
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

  get_user_image(): string {
    const boot = (window as any).dash?.boot;
    const bootUser = boot?.user;
    // Try user_info first (has image), then fall back
    const userInfo = boot?.user_info?.[bootUser?.name];
    return String(userInfo?.image || bootUser?.user_image || "").trim();
  },

  get_email(): string {
    const bootUser = (window as any).dash?.boot?.user;
    return String(bootUser?.email || "").trim();
  },
};
