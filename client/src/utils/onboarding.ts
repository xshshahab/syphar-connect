const ONBOARDED_KEY = "syphar-onboarded";
const ONE_YEAR = 60 * 60 * 24 * 365;

// The flag is kept in localStorage and mirrored in a long-lived cookie, so
// it still works when one of the two is blocked or cleared on this device.
// Storage access is wrapped in try/catch: it can throw (private mode etc.).
export const hasOnboarded = (): boolean => {
  try {
    if (localStorage.getItem(ONBOARDED_KEY) === "true") return true;
  } catch {
    // fall through to the cookie
  }
  return document.cookie
    .split("; ")
    .some((entry) => entry === `${ONBOARDED_KEY}=true`);
};

export const markOnboarded = (): void => {
  try {
    localStorage.setItem(ONBOARDED_KEY, "true");
  } catch {
    // ignore
  }
  document.cookie = `${ONBOARDED_KEY}=true; max-age=${ONE_YEAR}; path=/; SameSite=Lax`;
};
