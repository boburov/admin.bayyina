import appleLogo from "../assets/icons/apple-logo.svg";
import windowsLogo from "../assets/icons/windows-logo.svg";
import playMarketLogo from "../assets/icons/play-market-logo.svg";

export const downloadPlatforms = [
  {
    id: "windows",
    disabled: false,
    label: "Windows",
    icon: windowsLogo,
    sublabel: "Kompyuter uchun",
    url: "https://mbsi.fra1.cdn.digitaloceanspaces.com/apps/MBSI%20School%20Setup%201.0.0.exe",
  },
  {
    disabled: true,
    id: "playmarket",
    label: "Google Play",
    icon: playMarketLogo,
    sublabel: "Android uchun",
    url: "https://play.google.com",
  },
  {
    id: "appstore",
    disabled: true,
    icon: appleLogo,
    label: "App Store",
    sublabel: "iOS uchun",
    url: "https://apps.apple.com",
  },
];
