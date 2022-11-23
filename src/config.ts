import "dotenv/config";

interface AppConfig {
  app: {
    port: number;
    authToken: string;
  };
}

const config: AppConfig = {
  app: {
    port: parseInt(process.env.APP_PORT || "3000"),
    authToken: process.env.APP_AUTH_TOKEN || "secret",
  },
};

export default config;
