import axios from './index';

let getPOSList = async () => {
  const res = await axios.get('/restaurant/integrations');
  console.log('Onboarding request status', res.status);
  return res;
};

export const onboardingService = {
  getPOSList,
};
