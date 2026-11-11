'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface TeachMeContextType {
  isTeachMeActive: boolean;
  toggleTeachMe: () => void;
  setTeachMe: (active: boolean) => void;
}

const TeachMeContext = createContext<TeachMeContextType | undefined>(undefined);

export function TeachMeProvider({ children }: { children: React.ReactNode }) {
  const [isTeachMeActive, setIsTeachMeActive] = useState<boolean>(true);

  useEffect(() => {
    const saved = localStorage.getItem('student_lab_teach_me');
    if (saved !== null) {
      setIsTeachMeActive(saved === 'true');
    }
  }, []);

  const toggleTeachMe = () => {
    setIsTeachMeActive((prev) => {
      const next = !prev;
      localStorage.setItem('student_lab_teach_me', String(next));
      return next;
    });
  };

  const setTeachMe = (active: boolean) => {
    setIsTeachMeActive(active);
    localStorage.setItem('student_lab_teach_me', String(active));
  };

  return (
    <TeachMeContext.Provider value={{ isTeachMeActive, toggleTeachMe, setTeachMe }}>
      {children}
    </TeachMeContext.Provider>
  );
}

export function useTeachMe() {
  const context = useContext(TeachMeContext);
  if (!context) {
    throw new Error('useTeachMe must be used within a TeachMeProvider');
  }
  return context;
}

