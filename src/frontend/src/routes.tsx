import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import { LoginPage } from './modules/identity/pages/LoginPage';
import { RegisterPage } from './modules/identity/pages/RegisterPage';
import { MarketingPage } from './modules/marketing/pages/MarketingPage';
import { LibraryPage } from './modules/books/pages/LibraryPage';
import { UploadPage } from './modules/books/pages/UploadPage';
import { BookReaderPage } from './modules/books/pages/BookReaderPage';
import { routes } from './routes/paths';

export const router = createBrowserRouter([
  {
    path: routes.home,
    element: (
      <PublicRoute>
        <MarketingPage />
      </PublicRoute>
    ),
  },
  {
    path: routes.login,
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: routes.register,
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        path: routes.library,
        element: <LibraryPage />,
      },
      {
        path: routes.upload,
        element: <UploadPage />,
      },
      {
        path: 'book/:id',
        element: <BookReaderPage />,
      },
    ],
  },
  {
    path: '*',
    element: <Navigate to={routes.home} replace />,
  },
]);
