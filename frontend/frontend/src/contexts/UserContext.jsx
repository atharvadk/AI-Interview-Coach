import React, { createContext, useState } from 'react';

// eslint-disable-next-line react-refresh/only-export-components
export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState({
    username: 'jobseeker123',
    email: 'jobseeker@example.com',
    pastSessions: [
      {
        id: 1,
        date: '2025-09-01',
        postureScore: 72,
        eyeTrackingScore: 80,
        confidenceScore: 75,
        correctAnswers: 68
      },
      {
        id: 2,
        date: '2025-09-10',
        postureScore: 78,
        eyeTrackingScore: 85,
        confidenceScore: 82,
        correctAnswers: 70
      }
    ],
  });

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};
