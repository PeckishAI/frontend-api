import axios from './index';

const getPOSList = async () => {
  const res = await axios.get('/integrations');
  console.log('Onboarding request status', res.status);
  return res;
};

const login = (
  user_uuid: string,
  credentials: { username: string; password: string }
) => {
  return axios.post('/integrate/' + user_uuid, credentials);
};

export const onboardingService = {
  getPOSList,
  login,
};
