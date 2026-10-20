import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.hissi.app",
  appName: "حصصي",
  // Static SPA output produced by `CAPACITOR=1 bun run build`
  webDir: "dist/client",
  plugins: {
    LocalNotifications: { smallIcon: "ic_stat_icon_config_sample", iconColor: "#1f6f6b" },
  },
};

export default config;
