import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainResearchLayout } from '../components/layout/MainResearchLayout';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainResearchLayout />,
  },
  {
    path: '/chat/:chatId',
    element: <MainResearchLayout />,
  },
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);
