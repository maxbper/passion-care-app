import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as lang from "./lang";

i18n.use(initReactI18next).init({
  compatibilityJSON: "v4",
  resources: {
    ...Object.entries(lang).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [key]: {
          translation: value,
        },
      }),
      {}
    ),
  },
  lng: "pt",
});

export default i18n;