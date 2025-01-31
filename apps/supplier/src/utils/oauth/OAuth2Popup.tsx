import { useEffect } from 'react';
import { OAUTH_RESPONSE, OAUTH_STATE_KEY } from './constants';
import { LoadingAbsolute } from 'shared-ui';

const checkState = (receivedState: string) => {
  const state = sessionStorage.getItem(OAUTH_STATE_KEY);
  console.log('state', state);
  console.log('receivedState', receivedState);

  return state === receivedState;
};

const queryToObject = (query: string) => {
  const parameters = new URLSearchParams(query);
  return Object.fromEntries(parameters.entries());
};

const OAuthPopup = () => {
  // On mount
  useEffect(() => {
    const payload = queryToObject(window.location.search.split('?')[1]);
    const state = payload && payload.state;
    const error = payload && payload.error;

    if (!window.opener) {
      throw new Error('No window opener');
    }

    if (error) {
      window.opener.postMessage({
        type: OAUTH_RESPONSE,
        error: decodeURI(error) || 'OAuth error: An error has occured.',
      });
    } else if (state && checkState(state)) {
      window.opener.postMessage({
        type: OAUTH_RESPONSE,
        payload,
      });
    } else {
      window.opener.postMessage({
        type: OAUTH_RESPONSE,
        error: 'OAuth error: State mismatch.',
      });
    }
  }, []);

  return <LoadingAbsolute />;
};

export default OAuthPopup;
