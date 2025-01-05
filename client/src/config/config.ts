
const getBaseUrl = (): string => {
  const env = process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      return "https://backend-spradier.replit.app";
    case "development":
      return "http://0.0.0.0:5000";
    default:
      return "http://0.0.0.0:5000";
  }
};

export const config = {
  apiBaseUrl: getBaseUrl(),
};
