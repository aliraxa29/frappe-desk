export interface Utils {
    formatDate(date: Date): string;
    parseDate(dateString: string): Date;
}

export const utils: Utils = {
    formatDate(date: Date): string {
        return date.toISOString().split('T')[0];
    }

    parseDate(dateString: string): Date {
        return new Date(dateString);
    }
}