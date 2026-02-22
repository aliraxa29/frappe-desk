export interface Session {
  logged_in_user: string;
  user: string;
  user_email: string;
  user_fullname: string;
}

export const session: Session = {
  logged_in_user: "",
  user: "",
  user_email: "",
  user_fullname: "",
};
