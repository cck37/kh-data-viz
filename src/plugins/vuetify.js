import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";
import "@mdi/font/css/materialdesignicons.css";

const theme = {
  dark: true,
  colors: {
    surface: "#242729",
    primary: "#404c50",
    secondary: "#ffc107",
    accent: "#2196f3",
    error: "#f44336",
    warning: "#ff5722",
    info: "#00bcd4",
    success: "#4caf50",
  },
};

export default new createVuetify({
  theme: {
    defaultTheme: "theme",
    themes: {
      theme,
    },
  },
  icons: {
    defaultSet: "mdi", // This is already the default value - only for display purposes
  },
  components,
  directives,
});
