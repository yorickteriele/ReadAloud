import { createBrowserRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './components/layout';
import { PrivateRoute, PublicRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { LibraryPage } from './pages/LibraryPage';
import { UploadPage } from './pages/UploadPage';
import { BookReaderPage } from './pages/BookReaderPage';

export const router = createBrowserRouter([
  {
    path: '/login',
    element: (
      <PublicRoute>
        <LoginPage />
      </PublicRoute>
    ),
  },
  {
    path: '/register',
    element: (
      <PublicRoute>
        <RegisterPage />
      </PublicRoute>
    ),
  },
  {
    path: '/',
    element: (
      <PrivateRoute>
        <MainLayout />
      </PrivateRoute>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/library" replace />,
      },
      {
        path: 'library',
        element: <LibraryPage />,
      },
      {
        path: 'upload',
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
    element: <Navigate to="/library" replace />,
  },
]);
