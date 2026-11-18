export interface CouponColor {
  bg: string;
  text: string;
  subtext: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description?: string | null;
  recommended: boolean;
  display_order?: number;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
    "text-secondary": string;
    icons: string;
    border: string;
  };
  couponColors: {
    percent: CouponColor;
    amount: CouponColor;
    delivery: CouponColor;
  };
}

// Presets now live in the DB and are fetched from GET /themes/
// (see getThemePresets in src/api/storeTheme.ts). These types are the
// shape of each theme object the API returns.
