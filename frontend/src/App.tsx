import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useEffect, useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import CaminoPage from './pages/CaminoPage';
import BookPathPage from './pages/BookPathPage';
import ChapterReaderPage from './pages/ChapterReaderPage';
import FreeReadingPage from './pages/FreeReadingPage';
import FreeBookChaptersPage from './pages/FreeBookChaptersPage';
import FreeVerseReaderPage from './pages/FreeVerseReaderPage';
import ProfilePage from './pages/ProfilePage';
import SearchPage from './pages/SearchPage';
import StatsPage from './pages/StatsPage';
import AppConfigPage from './pages/AppConfigPage';
import ProtectedRoute from './components/ProtectedRoute';
import ScrollToTop from './components/ScrollToTop';
import ScrollToTopButton from './components/ScrollToTopButton';
import { useAuthStore } from './stores/authStore';
import { authApi } from './services/api';
import { TutorialProvider } from './contexts/TutorialContext';

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logout = useAuthStore((state) => state.logout);
  const [loading, setLoading] = useState(true);

  // Revalidar usuario al cargar la app
  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      authApi.me()
        .then((data) => {
          setAuth(data.user, data.roles, data.permissions, token);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Failed to revalidate user:', error);
          logout();
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Mostrar loading mientras se revalida el usuario
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600 mx-auto"></div>
          <p className="text-gray-600 mt-4 text-lg font-semibold">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TutorialProvider>
        <BrowserRouter>
          <ScrollToTop />
          <ScrollToTopButton />
          <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
          />
          <Route
            path="/register"
            element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />}
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <HomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/perfil"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/estadisticas"
            element={
              <ProtectedRoute>
                <StatsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/config"
            element={
              <ProtectedRoute>
                <AppConfigPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/buscar"
            element={
              <ProtectedRoute>
                <SearchPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/camino"
            element={
              <ProtectedRoute>
                <CaminoPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/camino/:bookSlug"
            element={
              <ProtectedRoute>
                <BookPathPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/camino/:bookSlug/:chapterNumber"
            element={
              <ProtectedRoute>
                <ChapterReaderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lectura-libre"
            element={
              <ProtectedRoute>
                <FreeReadingPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lectura-libre/:bookSlug"
            element={
              <ProtectedRoute>
                <FreeBookChaptersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lectura-libre/:bookSlug/:chapterNumber"
            element={
              <ProtectedRoute>
                <FreeVerseReaderPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/lectura-libre/:bookSlug/:chapterNumber/:verseNumber"
            element={
              <ProtectedRoute>
                <FreeVerseReaderPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      </TutorialProvider>
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1F2937',
            color: '#fff',
            padding: '16px',
            borderRadius: '8px',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}

export default App;
