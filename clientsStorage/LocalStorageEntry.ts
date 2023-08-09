import { Theme } from "../components/LocaleAndThemingOptions";

export class LocalStorageWrapper {
  private inMemoryItems: Record<string, string> = {};

  setItem(key: string, value: string): void {
    this.inMemoryItems[key] = value;

    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // noop, this is expected to fail in incognito mode
    }
  }

  getItem(key: string): string | null {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      // this is expected to fail in incognito mode
      return this.inMemoryItems[key] || null;
    }
  }

  removeItem(key: string): void {
    delete this.inMemoryItems[key];

    try {
      localStorage.removeItem(key);
    } catch (error) {
      // noop, this is expected to fail in incognito mode
    }
  }
}

const localStorageWrapper = new LocalStorageWrapper();

export const getThemeInStorage = () => {
  return (localStorageWrapper.getItem("theme") as Theme) ?? "Light";
};

export const setThemeInStorage = (theme: Theme) => {
  localStorageWrapper.setItem("theme", theme);
};

export const getLocaleInStorage = () => {
  return localStorageWrapper.getItem("locale") ?? "en";
};

export const setLocaleInStorage = (locale: string) => {
  localStorageWrapper.setItem("locale", locale);
};

export type ConnectJSSource =
  | "prod"
  | "local"
  | "popoverinline-cdn"
  | "popoverinline-storage"
  | "popoveraccesory-cdn"
  | "popoveraccesory-storage";

export const getConnectJSSourceInStorage = (): ConnectJSSource => {
  return (
    (localStorageWrapper.getItem("connectjssource") as ConnectJSSource) ??
    "prod"
  );
};

export const setConnectJSSourceInStorage = (source: ConnectJSSource) => {
  localStorageWrapper.setItem("connectjssource", source);
};
