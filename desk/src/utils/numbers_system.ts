import { __ } from "./translate";

export default {
  default: [
    {
      divisor: 1.0e12,
      symbol: __("T", undefined, "Number system"),
    },
    {
      divisor: 1.0e9,
      symbol: __("B", undefined, "Number system"),
    },
    {
      divisor: 1.0e6,
      symbol: __("M", undefined, "Number system"),
    },
    {
      divisor: 1.0e3,
      symbol: __("K", undefined, "Number system"),
    },
  ],
  indian: [
    {
      divisor: 1.0e7,
      symbol: __("Cr", undefined, "Number system"),
    },
    {
      divisor: 1.0e5,
      symbol: __("L", undefined, "Number system"),
    },
    {
      divisor: 1.0e3,
      symbol: __("K", undefined, "Number system"),
    },
  ],
  nepalese: [
    {
      divisor: 1.0e11,
      symbol: __("Kh", undefined, "Number system"), // 10^11 is read as 1 Kharba
    },
    {
      divisor: 1.0e9,
      symbol: __("Ar", undefined, "Number system"), // 10^9 is read as 1 Arba
    },
    {
      divisor: 1.0e7,
      symbol: __("Cr", undefined, "Number system"),
    },
    {
      divisor: 1.0e5,
      symbol: __("L", undefined, "Number system"),
    },
    {
      divisor: 1.0e3,
      symbol: __("K", undefined, "Number system"),
    },
  ],
};
