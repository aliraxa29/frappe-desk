import { reactive } from "vue";

export class FormDashboard {
  indicators: Array<{ label: string; color: string }>;
  stats: Array<{ label: string; value: any }>;

  constructor() {
    this.indicators = reactive([]);
    this.stats = reactive([]);
  }

  add_indicator(label: string, color: string): void {
    this.indicators.push({ label, color });
  }

  clear_indicators(): void {
    this.indicators.splice(0, this.indicators.length);
  }

  add_stat(label: string, value: any): void {
    this.stats.push({ label, value });
  }

  clear_stats(): void {
    this.stats.splice(0, this.stats.length);
  }
}
