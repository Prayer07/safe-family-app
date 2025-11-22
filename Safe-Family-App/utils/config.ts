// utils/config.ts
import Constants from "expo-constants";

type Environment = "development" | "staging" | "production";

const ENV: Environment =
  (Constants?.manifest?.extra?.env as Environment) || "development";

const CONFIG = {
  development: {
    API_URL: "http://10.173.104.65:5000/api",
  },
  staging: {
    API_URL: "https://safe-family3.vercel.app/api",
  },
  production: {
    API_URL: "https://safe-family3.onrender.com/api",
  },
};

export default {
  ...CONFIG[ENV],
  ENV,
};