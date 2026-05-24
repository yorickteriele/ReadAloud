import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LibraryPage } from './pages/LibraryPage';
import { UploadPage } from './pages/UploadPage';
import { BookReaderPage } from './pages/BookReaderPage';
import { routes } from './routes/paths';

export const router = createBrowserRouter([
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
    path: routes.home,
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to={routes.library} replace />,
      },
      {
        path: routes.library.slice(1),
        element: <LibraryPage />,
      },
      {
        path: routes.upload.slice(1),
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
    element: <Navigate to={routes.library} replace />,
  },
]);
