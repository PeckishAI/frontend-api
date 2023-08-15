// import { useEffect } from 'react';
// import { Outlet, useNavigate, useParams } from 'react-router-dom';
// import { availableLanguages } from '../translation/i18n';

// export const TranslationHandler = () => {
//   const { lang } = useParams();
//   const navigate = useNavigate();
//   console.log('langue', lang);

//   useEffect(() => {
//     if (!lang || !availableLanguages.includes(lang)) navigate('/en');
//   }, [lang, navigate]);

//   return <Outlet />;
// };
