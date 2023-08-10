import axios from './index';

let getPOSList = async () => {
  const res = await axios.get('/onboarding/pos');
  console.log('inventory request status', res.status);
  return res;
};

export const onboardingService = {
  getPOSList,
};
