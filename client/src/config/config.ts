const getBaseUrl = (): string => {
  const env = process.env.NODE_ENV || "development";

  switch (env) {
    case "production":
      return "https://backend-spradier.replit.app";
    case "development": 
      return "https://backend-spradier.replit.app"; 
    default:
      return "https://backend-spradier.replit.app";
  }
};

export const config = {
  apiBaseUrl: getBaseUrl(),
  authUrl: 'https://platform.iampeckish.com',
  cookieDomain: 'iampeckish.com',
  apiGateway: 'https://api-gateway-zqjpx7oxsq-ew.a.run.app',
  googleClientId: '902125317537-r9ck7q1bi9m01f1ilopjlvi2itrupdut.apps.googleusercontent.com',
  appleClientId: 'com.peckish.web'
};