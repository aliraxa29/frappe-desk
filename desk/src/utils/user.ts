export interface User {
    get_full_name(): string;
    get_email(): string;
}

export const user: User = {
    get_full_name(): string {
        return `${window.dash.boot.user.first_name} ${window.dash.boot.user.last_name}`.trim();
    },

    get_email(): string {
        return window.dash.boot.user.email;
    }
}