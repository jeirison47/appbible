import React, { createContext, useContext, useState, useEffect } from 'react';

interface TutorialProgress {
  completed: boolean;
  currentStep: number;
  skipped: boolean;
  completedAt?: string;
}

interface TutorialContextType {
  onboarding: TutorialProgress;
  streak: TutorialProgress;
  freeReading: TutorialProgress;
  path: TutorialProgress;
  isLoading: boolean;
  activeTutorial: string | null;
  startTutorial: (tutorialId: string) => void;
  completeTutorial: (tutorialId: string) => void;
  skipTutorial: (tutorialId: string) => void;
  resetTutorial: (tutorialId: string) => void;
  updateProgress: (tutorialId: string, step: number) => void;
  refreshTutorials: () => Promise<void>;
}

const TutorialContext = createContext<TutorialContextType | undefined>(undefined);

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

export const TutorialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tutorials, setTutorials] = useState({
    onboarding: { completed: false, currentStep: 0, skipped: false },
    streak: { completed: false, currentStep: 0, skipped: false },
    freeReading: { completed: false, currentStep: 0, skipped: false },
    path: { completed: false, currentStep: 0, skipped: false },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [activeTutorial, setActiveTutorial] = useState<string | null>(null);

  const refreshTutorials = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${API_URL}/tutorials/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      if (!response.ok) {
        console.warn('Failed to fetch tutorials:', response.status);
        setIsLoading(false);
        return;
      }

      const data = await response.json();
      if (data.success) {
        setTutorials(data.data);
      }
    } catch (error) {
      console.error('Error fetching tutorials:', error);
      // No bloquear la app si falla la carga de tutoriales
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshTutorials();
  }, []);

  const startTutorial = (tutorialId: string) => {
    setActiveTutorial(tutorialId);
  };

  const completeTutorial = async (tutorialId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/tutorials/${tutorialId}/complete`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setActiveTutorial(null);
      await refreshTutorials();
    } catch (error) {
      console.error('Error completing tutorial:', error);
    }
  };

  const skipTutorial = async (tutorialId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/tutorials/${tutorialId}/skip`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      setActiveTutorial(null);
      await refreshTutorials();
    } catch (error) {
      console.error('Error skipping tutorial:', error);
    }
  };

  const resetTutorial = async (tutorialId: string) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/tutorials/${tutorialId}/reset`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      });

      await refreshTutorials();
    } catch (error) {
      console.error('Error resetting tutorial:', error);
    }
  };

  const updateProgress = async (tutorialId: string, step: number) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      await fetch(`${API_URL}/tutorials/${tutorialId}/progress`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ currentStep: step }),
      });
    } catch (error) {
      console.error('Error updating progress:', error);
    }
  };

  return (
    <TutorialContext.Provider
      value={{
        ...tutorials,
        isLoading,
        activeTutorial,
        startTutorial,
        completeTutorial,
        skipTutorial,
        resetTutorial,
        updateProgress,
        refreshTutorials,
      }}
    >
      {children}
    </TutorialContext.Provider>
  );
};

export const useTutorial = () => {
  const context = useContext(TutorialContext);
  if (context === undefined) {
    throw new Error('useTutorial must be used within a TutorialProvider');
  }
  return context;
};
