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
    id: "royal-indian-heritage",
    name: "Royal Indian Heritage",
    description:
      "Premium Indian cultural design with royal red, antique gold, and warm ivory",
    recommended: true,
    colors: {
      primary: "#C8202F",
      secondary: "#791C24",
      accent: "#D6A64F",
      background: "#FFF5E5",
      surface: "#FFFFFF",
      text: "#211B19",
      "text-secondary": "#FFF",
      icons: "#791C24",
      border: "#E5CFA9",
    },
    couponColors: {
      percent: {
        bg: "#FBE6E5",
        text: "#C8202F",
        subtext: "#8C4145",
      },
      amount: {
        bg: "#F8EACB",
        text: "#80551A",
        subtext: "#927849",
      },
      delivery: {
        bg: "#E7F0E2",
        text: "#386B3F",
        subtext: "#648067",
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
  {
    id: "terracotta-clay",
    name: "Terracotta Clay",
    description: "Earthy terracotta with soft peach and warm sand surfaces",
    recommended: true,
    colors: {
      primary: "#C2562F",
      secondary: "#FBEFE6",
      accent: "#E8A87C",
      background: "#FBF3EC",
      surface: "#FFFFFF",
      text: "#3A2418",
      "text-secondary": "#FBEFE6",
      icons: "#C2562F",
      border: "#EBD7C8",
    },
    couponColors: {
      percent: { bg: "#FBE5DA", text: "#B54A25", subtext: "#94604B" },
      amount: { bg: "#F8EBCB", text: "#8A5E12", subtext: "#8C7547" },
      delivery: { bg: "#E4EEE0", text: "#3A6B45", subtext: "#627D66" },
    },
  },
  {
    id: "rose-blush",
    name: "Rose Blush",
    description: "Soft raspberry rose with blush pink and a gentle cream feel",
    recommended: false,
    colors: {
      primary: "#C93A6B",
      secondary: "#FFF0F3",
      accent: "#F4A6B8",
      background: "#FFF5F7",
      surface: "#FFFFFF",
      text: "#3B1F2B",
      "text-secondary": "#FFF0F3",
      icons: "#C93A6B",
      border: "#F3D9E0",
    },
    couponColors: {
      percent: { bg: "#FDE4EA", text: "#B02A57", subtext: "#94566A" },
      amount: { bg: "#FFEBD6", text: "#A0560F", subtext: "#8F6E4A" },
      delivery: { bg: "#E3F1EA", text: "#2F6F52", subtext: "#5C8070" },
    },
  },
  {
    id: "ocean-teal-coral",
    name: "Ocean Teal & Coral",
    description:
      "Deep sea teal with a playful coral accent on a cool mist background",
    recommended: true,
    colors: {
      primary: "#0F766E",
      secondary: "#ECF8F6",
      accent: "#FF8A71",
      background: "#F0F9F8",
      surface: "#FFFFFF",
      text: "#12302D",
      "text-secondary": "#ECF8F6",
      icons: "#0F766E",
      border: "#D3E8E5",
    },
    couponColors: {
      percent: { bg: "#DDF2EF", text: "#0F766E", subtext: "#4F7F7A" },
      amount: { bg: "#FFE6DF", text: "#C2452B", subtext: "#99645A" },
      delivery: { bg: "#E5F0DF", text: "#3F7A2E", subtext: "#67805C" },
    },
  },
  {
    id: "mocha-cream",
    name: "Mocha Cream",
    description: "Cozy coffee brown with caramel accents and creamy neutrals",
    recommended: false,
    colors: {
      primary: "#7B4B2A",
      secondary: "#F6EDE3",
      accent: "#D4A373",
      background: "#FAF4EC",
      surface: "#FFFFFF",
      text: "#2B1D14",
      "text-secondary": "#F6EDE3",
      icons: "#7B4B2A",
      border: "#E8DAC9",
    },
    couponColors: {
      percent: { bg: "#F1E1D3", text: "#7B4B2A", subtext: "#8F6F58" },
      amount: { bg: "#F7E9C8", text: "#8A6414", subtext: "#8C7A4A" },
      delivery: { bg: "#E3EDDF", text: "#3B6B43", subtext: "#61806A" },
    },
  },
  {
    id: "lavender-mist",
    name: "Lavender Mist",
    description: "Dreamy periwinkle violet with airy lilac surfaces",
    recommended: false,
    colors: {
      primary: "#6D5BD0",
      secondary: "#F4F2FD",
      accent: "#B8A9F5",
      background: "#F7F5FE",
      surface: "#FFFFFF",
      text: "#25203F",
      "text-secondary": "#F4F2FD",
      icons: "#6D5BD0",
      border: "#E2DDF6",
    },
    couponColors: {
      percent: { bg: "#ECE8FC", text: "#5846BB", subtext: "#7A71A8" },
      amount: { bg: "#FDEBF3", text: "#B03A78", subtext: "#98607F" },
      delivery: { bg: "#E1F2EE", text: "#26705F", subtext: "#5A8277" },
    },
  },
  {
    id: "saffron-marigold",
    name: "Saffron Marigold",
    description: "Sunny saffron and marigold with a buttery warm background",
    recommended: false,
    colors: {
      primary: "#E58A00",
      secondary: "#FFF6DD",
      accent: "#F2B705",
      background: "#FFFAEB",
      surface: "#FFFFFF",
      text: "#3D2A08",
      "text-secondary": "#FFF6DD",
      icons: "#D97B00",
      border: "#F1E2B8",
    },
    couponColors: {
      percent: { bg: "#FFEACC", text: "#B35F00", subtext: "#98693A" },
      amount: { bg: "#FFF1B8", text: "#8A6500", subtext: "#8A7A3C" },
      delivery: { bg: "#E6F1D9", text: "#46761F", subtext: "#6A8350" },
    },
  },
  {
    id: "midnight-navy-gold",
    name: "Midnight Navy & Gold",
    description: "Luxurious deep navy surfaces with champagne gold highlights",
    recommended: true,
    colors: {
      primary: "#E5B84B",
      secondary: "#F4EBD3",
      accent: "#7C9CFF",
      background: "#0E1522",
      surface: "#172033",
      text: "#F1F3F8",
      "text-secondary": "#F4EBD3",
      icons: "#E5B84B",
      border: "#2A3550",
    },
    couponColors: {
      percent: { bg: "#3A2433", text: "#FF8FA3", subtext: "#D4A3B0" },
      amount: { bg: "#3A3220", text: "#E5B84B", subtext: "#CDB98A" },
      delivery: { bg: "#1F3A38", text: "#5EE0C0", subtext: "#98CFC0" },
    },
  },
  {
    id: "forest-emerald-dark",
    name: "Forest Emerald Dark",
    description: "Deep forest surfaces with glowing emerald and soft gold",
    recommended: false,
    colors: {
      primary: "#3DD68C",
      secondary: "#E8F5EE",
      accent: "#F2C46D",
      background: "#0F1A15",
      surface: "#18271F",
      text: "#EAF5EE",
      "text-secondary": "#E8F5EE",
      icons: "#3DD68C",
      border: "#2B4034",
    },
    couponColors: {
      percent: { bg: "#1F3A2C", text: "#5CE0A0", subtext: "#9CCDB2" },
      amount: { bg: "#3B3322", text: "#F2C46D", subtext: "#D2BD90" },
      delivery: { bg: "#1F3640", text: "#6CCBE8", subtext: "#9CC3D1" },
    },
  },
];
