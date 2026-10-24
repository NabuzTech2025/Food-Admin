export interface CouponColor {
  bg: string;
  text: string;
  subtext: string;
}

export interface ColorPalette {
  id: string;
  name: string;
  description: string;
  recommended: boolean;
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

export const colorPalettes: ColorPalette[] = [
  {
    id: "classic-food-red",
    name: "Classic Food Red",
    description: "Bold restaurant red with a warm, inviting background",
    recommended: false,
    colors: {
      primary: "#E9251A",
      secondary: "#FFF4EF",
      accent: "#FF6B35",
      background: "#FFF4EF",
      surface: "#FFFFFF",
      text: "#202124",
      "text-secondary": "#6B625E",
      icons: "#E9251A",
      border: "#F0DCD5",
    },
    couponColors: {
      percent: {
        bg: "#FFF0ED",
        text: "#E9251A",
        subtext: "#B84B42",
      },
      amount: {
        bg: "#FFF1E8",
        text: "#FF6B35",
        subtext: "#A8542C",
      },
      delivery: {
        bg: "#F0F8E9",
        text: "#287A32",
        subtext: "#557A4D",
      },
    },
  },
  {
    id: "fresh-green",
    name: "Fresh Green",
    description: "Fresh, bright green with a clean natural appearance",
    recommended: false,
    colors: {
      primary: "#16803C",
      secondary: "#F1FAF0",
      accent: "#65D957",
      background: "#F1FAF0",
      surface: "#FFFFFF",
      text: "#183322",
      "text-secondary": "#F1FAF0",
      icons: "#16803C",
      border: "#D5E8D3",
    },
    couponColors: {
      percent: {
        bg: "#E8F6E9",
        text: "#16803C",
        subtext: "#426D4A",
      },
      amount: {
        bg: "#F0F9DF",
        text: "#568C19",
        subtext: "#66804C",
      },
      delivery: {
        bg: "#E0F5ED",
        text: "#087F68",
        subtext: "#4D7D70",
      },
    },
  },
  {
    id: "modern-blue",
    name: "Modern Blue",
    description: "Modern blue with cool, clean surfaces",
    recommended: false,
    colors: {
      primary: "#4338E8",
      secondary: "#F1F7FF",
      accent: "#5A8EFF",
      background: "#F1F7FF",
      surface: "#FFFFFF",
      text: "#172B4D",
      "text-secondary": "#F1F7FF",
      icons: "#4338E8",
      border: "#D8E3F4",
    },
    couponColors: {
      percent: {
        bg: "#EAE9FF",
        text: "#4338E8",
        subtext: "#625CA8",
      },
      amount: {
        bg: "#E5F0FF",
        text: "#2563EB",
        subtext: "#5276AD",
      },
      delivery: {
        bg: "#E0F7FA",
        text: "#087F8C",
        subtext: "#4D7F88",
      },
    },
  },
  {
    id: "spicy-orange",
    name: "Spicy Orange",
    description: "Energetic orange with warm golden accents",
    recommended: false,
    colors: {
      primary: "#FF7000",
      secondary: "#FFF7E8",
      accent: "#FFCA2E",
      background: "#FFF7E8",
      surface: "#FFFFFF",
      text: "#592A13",
      "text-secondary": "#592A13",
      icons: "#FF7000",
      border: "#F0DFC2",
    },
    couponColors: {
      percent: {
        bg: "#FFE9DD",
        text: "#E64A00",
        subtext: "#A64F2A",
      },
      amount: {
        bg: "#FFF0C2",
        text: "#B85C00",
        subtext: "#8C672C",
      },
      delivery: {
        bg: "#EAF5D7",
        text: "#4B7F16",
        subtext: "#637C43",
      },
    },
  },
  {
    id: "premium-purple",
    name: "Premium Purple",
    description: "Premium purple with soft lavender accents",
    recommended: false,
    colors: {
      primary: "#8D00DE",
      secondary: "#F7F2FF",
      accent: "#D081FF",
      background: "#F7F2FF",
      surface: "#FFFFFF",
      text: "#2E194C",
      "text-secondary": "#F7F2FF",
      icons: "#8D00DE",
      border: "#E5D5F3",
    },
    couponColors: {
      percent: {
        bg: "#F2E5FF",
        text: "#8D00DE",
        subtext: "#8155A0",
      },
      amount: {
        bg: "#FCE7FF",
        text: "#B423C8",
        subtext: "#995DA0",
      },
      delivery: {
        bg: "#E6F7F0",
        text: "#16856B",
        subtext: "#548477",
      },
    },
  },
  {
    id: "dark-cinematic",
    name: "Dark Cinematic",
    description: "Dark premium theme with vivid red and golden accents",
    recommended: false,
    colors: {
      primary: "#FF003B",
      secondary: "#F5F5F5",
      accent: "#FFB547",
      background: "#111315",
      surface: "#222529",
      text: "#F5F5F5",
      "text-secondary": "#B8BBC1",
      icons: "#FFFFFF",
      border: "#393C42",
    },
    couponColors: {
      percent: {
        bg: "#4A1E2C",
        text: "#FF003B",
        subtext: "#DC859D",
      },
      amount: {
        bg: "#4A3F2E",
        text: "#FFB547",
        subtext: "#DCC4A1",
      },
      delivery: {
        bg: "#244840",
        text: "#2EE6A6",
        subtext: "#93D5C2",
      },
    },
  },
  {
    id: "warm-espresso-orange",
    name: "Warm Espresso Orange",
    description: "Rich espresso surfaces with warm orange highlights",
    recommended: false,
    colors: {
      primary: "#F58A36",
      secondary: "#FFF1DC",
      accent: "#FFBE73",
      background: "#29221E",
      surface: "#382D27",
      text: "#FFF1DC",
      "text-secondary": "#C9B9A8",
      icons: "#FFBE73",
      border: "#59463A",
    },
    couponColors: {
      percent: {
        bg: "#493027",
        text: "#FF9478",
        subtext: "#D7AA98",
      },
      amount: {
        bg: "#4B3927",
        text: "#FFC56E",
        subtext: "#D9BE98",
      },
      delivery: {
        bg: "#303E32",
        text: "#A5D6A7",
        subtext: "#B0C5AF",
      },
    },
  },
  {
    id: "sage-garden",
    name: "Sage Garden",
    description: "Soft natural green with warm neutral surfaces",
    recommended: true,
    colors: {
      primary: "#527A55",
      secondary: "#F5F7F0",
      accent: "#A9C89A",
      background: "#F5F7F0",
      surface: "#FFFFFF",
      text: "#26372A",
      "text-secondary": "#F5F7F0",
      icons: "#527A55",
      border: "#DCE5D7",
    },
    couponColors: {
      percent: {
        bg: "#E7EFE1",
        text: "#3F6945",
        subtext: "#627C62",
      },
      amount: {
        bg: "#F6EBD4",
        text: "#80652E",
        subtext: "#8B7955",
      },
      delivery: {
        bg: "#E2F0E7",
        text: "#356C50",
        subtext: "#5C806A",
      },
    },
  },
  {
    id: "eucalyptus-mint",
    name: "Eucalyptus Mint",
    description: "Muted eucalyptus green with cool mint accents",
    recommended: false,
    colors: {
      primary: "#39766C",
      secondary: "#F2F7F6",
      accent: "#A8D5C7",
      background: "#F2F7F6",
      surface: "#FFFFFF",
      text: "#233B37",
      "text-secondary": "#F2F7F6",
      icons: "#39766C",
      border: "#D8E7E3",
    },
    couponColors: {
      percent: {
        bg: "#E0EFEB",
        text: "#316A60",
        subtext: "#5D8078",
      },
      amount: {
        bg: "#E9F0D9",
        text: "#5E7138",
        subtext: "#718052",
      },
      delivery: {
        bg: "#DCEFE8",
        text: "#286B58",
        subtext: "#568073",
      },
    },
  },
  {
    id: "spicy-green",
    name: "Spicy Green",
    description: "Bold herb green with vibrant lime and warm cream",
    recommended: false,
    colors: {
      primary: "#247A3D",
      secondary: "#FFF7E8",
      accent: "#B8D943",
      background: "#FFF7E8",
      surface: "#FFFFFF",
      text: "#263A24",
      "text-secondary": "#FFF7E8",
      icons: "#247A3D",
      border: "#E5DFC9",
    },
    couponColors: {
      percent: {
        bg: "#E8F3DF",
        text: "#247A3D",
        subtext: "#587A4A",
      },
      amount: {
        bg: "#FFF0C2",
        text: "#A65A00",
        subtext: "#8C672C",
      },
      delivery: {
        bg: "#DDF4E5",
        text: "#167548",
        subtext: "#4D7D60",
      },
    },
  },
];
