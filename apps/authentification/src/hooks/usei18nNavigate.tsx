// import { useTranslation } from 'react-i18next';
// import {
//   NavigateFunction,
//   NavigateOptions,
//   To,
//   useNavigate,
// } from 'react-router-dom';

// export const useI18nNavigate = (): NavigateFunction => {
//   const navigate = useNavigate();
//   const { i18n } = useTranslation();

//   const customNavigate = (path: To | number, options?: NavigateOptions) => {
//     if (typeof path === 'string' && path.startsWith('/'))
//       navigate(`/${i18n.language}${path}`, options);
//     else if (typeof path === 'number') {
//       navigate(path);
//     } else navigate(path, options);
//   };

//   return customNavigate;
// };
