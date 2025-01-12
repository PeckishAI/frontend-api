const getBaseUrl = (): string => {
  const env = process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      return "https://backend-spradier.replit.app";
    case "development":
      return "https://76032c8e-3d86-413b-9c48-7b818a8ffaa3-00-9k9j5uta5z7r.janeway.replit.dev";
    default:
      return "https://76032c8e-3d86-413b-9c48-7b818a8ffaa3-00-9k9j5uta5z7r.janeway.replit.dev";
  }
};

export const config = {
  apiBaseUrl: getBaseUrl(),
  authUrl: getBaseUrl(),
  cookieDomain: ".replit.app",
  apiGateway: "https://api-gateway-zqjpx7oxsq-ew.a.run.app",
  googleClientId:
    "902125317537-r9ck7q1bi9m01f1ilopjlvi2itrupdut.apps.googleusercontent.com",
  appleClientId: "com.peckish.web",
};
