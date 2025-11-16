export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

export const APP_TITLE = "Friday AI Chat";

// Support email for accessibility feedback and general support
export const SUPPORT_EMAIL = "support@tekup.dk";

// Brandkit assets (use these across UI for consistent branding)
export const APP_LOGO_ICON = "/brandkit/logo-icon.png";
export const APP_LOGO_FULL = "/brandkit/logo-full.png";
export const APP_LOGO_AVATAR = "/brandkit/logo-avatar.png";
export const APP_LOGO_APP_ICON = "/brandkit/logo-app-icon.png";
export const APP_LOGO_CHAT = "/brandkit/logo-chat-icon.png";

// Backwards compatible alias, most compact places should use APP_LOGO_ICON
export const APP_LOGO = APP_LOGO_ICON;

// Login URL - Always use local dev-login (no OAuth redirect)
export const getLoginUrl = () => {
  // Development login endpoint (auto-login as OWNER)
  return "/api/auth/login";
};
