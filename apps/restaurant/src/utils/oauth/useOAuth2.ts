import { RefObject, useCallback, useRef, useState } from 'react';
import {
  OAUTH_RESPONSE,
  OAUTH_STATE_KEY,
  POPUP_HEIGHT,
  POPUP_WIDTH,
} from './constants';

const generateState = () => {
  const validChars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let array = new Uint8Array(40);
  window.crypto.getRandomValues(array);
  array = array.map(
    (x: number) => validChars.codePointAt(x % validChars.length) ?? 0
  );
  const randomState = String.fromCharCode.apply(null, Array.from(array));
  return randomState;
};

const saveState = (state: string) => {
  sessionStorage.setItem(OAUTH_STATE_KEY, state);
};

const removeState = () => {
  sessionStorage.removeItem(OAUTH_STATE_KEY);
};

const openPopup = (url: string) => {
  // To fix issues with window.screen in multi-monitor setups, the easier option is to
  // center the pop-up over the parent window.
  const top = window.outerHeight / 2 + window.screenY - POPUP_HEIGHT / 2;
  const left = window.outerWidth / 2 + window.screenX - POPUP_WIDTH / 2;
  console.log('open popup url: ', url);

  return window.open(
    url,
    'OAuth2 Popup',
    `height=${POPUP_HEIGHT},width=${POPUP_WIDTH},top=${top},left=${left}`
  );
};

const closePopup = (popupRef: RefObject<Window>) => {
  popupRef.current?.close();
};

const cleanup = (
  intervalRef: RefObject<NodeJS.Timeout>,
  popupRef: RefObject<Window>,
  handleMessageListener: (message: MessageEvent) => void
) => {
  if (intervalRef.current) clearInterval(intervalRef.current);
  closePopup(popupRef);
  removeState();
  window.removeEventListener('message', handleMessageListener);
};

const enhanceAuthorizeUrl = (
  authorizeUrl: string,
  clientId: string,
  redirectUri: string,
  scope: string,
  state: string
) => {
  const query = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: redirectUri,
    scope,
    state,
  }).toString();
  return `${authorizeUrl}?${query}`;
};

type Options = {
  authorizeUrl: string;
  clientId: string;
  redirectUri: string;
  scope?: string;
};

type DefaultData = {
  code: string;
};

export const useOAuth2 = <Data = DefaultData>(options: Options) => {
  const { authorizeUrl, clientId, redirectUri, scope = '' } = options;

  const popupRef = useRef<Window | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Data | null>(null);

  const getAuth = useCallback(() => {
    // 1. Init
    setLoading(true);
    setError(null);
    setData(null);

    // 2. Generate and save state
    const state = generateState();
    saveState(state);
    console.log('state: ', state);

    // 3. Open popup
    popupRef.current = openPopup(
      enhanceAuthorizeUrl(authorizeUrl, clientId, redirectUri, scope, state)
    );

    // 4. Register message listener
    async function handleMessageListener(message: MessageEvent) {
      if (!message || !message.data || message.data.type !== OAUTH_RESPONSE) {
        return;
      }

      console.log('OAuth message received: ', message);

      if (message.data.error) {
        setLoading(false);
        setError(message.data.error || 'Unknown Error');

        cleanup(intervalRef, popupRef, handleMessageListener);
        return;
      }

      // const code =
      //   message &&
      //   message.data &&
      //   message.data.payload &&
      //   message.data.payload.code;

      if (message.data.payload.state) delete message.data.payload.state;

      setData(message.data.payload as Data);
      setLoading(false);

      cleanup(intervalRef, popupRef, handleMessageListener);
    }
    window.addEventListener('message', handleMessageListener);

    // 4. Begin interval to check if popup was closed forcefully by the user
    intervalRef.current = setInterval(() => {
      const popupClosed =
        !popupRef.current?.window || popupRef.current?.window?.closed;

      if (popupClosed) {
        // Popup was closed before completing auth...
        console.warn(
          'Warning: Popup was closed before completing authentication.'
        );
        setLoading(false);
        setError('Popup was closed before completing authentication.');

        cleanup(intervalRef, popupRef, handleMessageListener);
      }
    }, 250);

    // Remove listener(s) on unmount
    return () => {
      window.removeEventListener('message', handleMessageListener);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [authorizeUrl, clientId, redirectUri, scope]);

  return { data, loading, error, getAuth };
};
