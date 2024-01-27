import Axios from './index';

const getIntegrations = () => {
  return Axios.get('/integrations');
};

const gmailIntegrate = (user_uuid: string) => {
  return Axios.post('/integration/gmail/', user_uuid);
};

export const integrationsService = { getIntegrations, gmailIntegrate };
