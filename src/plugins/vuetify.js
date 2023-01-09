import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const myCustomLightTheme = {
  dark: true,
  colors: {
    surface: "#242729",
    primary: "#242729",
    secondary: " #ffc107",
    accent: "#2196f3",
    error: " #f44336",
    warning: "#ff5722",
    info: "#00bcd4",
    success: "#4caf50",
  },
};

export default new createVuetify({
  theme: {
    defaultTheme: "myCustomLightTheme",
    themes: {
      myCustomLightTheme,
    },
  },
  components,
  directives,
});
