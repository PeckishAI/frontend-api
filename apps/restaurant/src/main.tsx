import { userService } from '@peckishai/user-management';
import dayjs from 'dayjs';
import Calendar from 'dayjs/plugin/calendar';
import CustomParseFormat from 'dayjs/plugin/customParseFormat';
import ReactDOM from 'react-dom/client';
import { Toaster } from 'react-hot-toast';
import { SkeletonTheme } from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import { RouterProvider } from 'react-router-dom';
import { GLOBAL_CONFIG } from 'shared-config';
import './index.scss';
import { router } from './routes/routes';
import './translation/i18n';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

dayjs.extend(Calendar);
dayjs.extend(CustomParseFormat);

userService.setConfig(GLOBAL_CONFIG);

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <QueryClientProvider client={queryClient}>
      <SkeletonTheme baseColor="#e2dcdc">
        <RouterProvider router={router} />
      </SkeletonTheme>
      <Toaster />
    </QueryClientProvider>
  </>
);
