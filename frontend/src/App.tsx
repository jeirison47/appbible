import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
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
import AppConfigPage from './pages/AppConfigPage';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthStore } from './stores/authStore';

const queryClient = new QueryClient();

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
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
