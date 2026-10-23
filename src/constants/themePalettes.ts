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
    accent: string;
    background: string;
    surface: string;
    text: string;
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
    description: "Energetic, familiar, best for food delivery",
    recommended: true,
    colors: {
      primary: "#E9251A",
      accent: "#FF6B35",
      background: "#FFF4EF",
      surface: "#FFFFFF",
      text: "#202124",
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
    id: "sage-garden",
    name: "Sage Garden",
    description: "Soft natural green with warm neutral surfaces",
    recommended: true,
    colors: {
      primary: "#527A55",
      accent: "#A9C89A",
      background: "#F5F7F0",
      surface: "#FFFFFF",
      text: "#26372A",
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
      accent: "#A8D5C7",
      background: "#F2F7F6",
      surface: "#FFFFFF",
      text: "#233B37",
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
    id: "modern-blue",
    name: "Modern Blue",
    description: "Clean, trustworthy, professional",
    recommended: false,
    colors: {
      primary: "#4338E8",
      accent: "#5A8EFF",
      background: "#F1F7FF",
      surface: "#FFFFFF",
      text: "#172B4D",
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
    description: "Bold, playful, street-food inspired",
    recommended: false,
    colors: {
      primary: "#FF7000",
      accent: "#FFCA2E",
      background: "#FFF7E8",
      surface: "#FFFFFF",
      text: "#592A13",
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
    description: "Distinctive, stylish, premium experience",
    recommended: false,
    colors: {
      primary: "#8D00DE",
      accent: "#D081FF",
      background: "#F7F2FF",
      surface: "#FFFFFF",
      text: "#2E194C",
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
    description: "Premium, bold, food photography focused",
    recommended: false,
    colors: {
      primary: "#FF003B",
      accent: "#FFB547",
      background: "#111315",
      surface: "#222529",
      text: "#F5F5F5",
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
    description: "Cozy, aesthetic, warm semi-dark restaurant theme",
    recommended: false,
    colors: {
      primary: "#F58A36",
      accent: "#FFBE73",
      background: "#29221E",
      surface: "#382D27",
      text: "#FFF1DC",
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
];
