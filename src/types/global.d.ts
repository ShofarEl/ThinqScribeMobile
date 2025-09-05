// Global type declarations for the ThinqScribe mobile app

declare module '@/src/context/AuthContext' {
  export const AuthProvider: React.FC<{ children: React.ReactNode }>;
  export const useAuth: () => any;
}

declare module '@/src/context/AppLoadingContext' {
  export const AppLoadingProvider: React.FC<{ children: React.ReactNode }>;
  export const useAppLoading: () => any;
}

declare module '@/src/context/NotificationContext' {
  export const NotificationProvider: React.FC<{ children: React.ReactNode }>;
  export const useNotifications: () => any;
}

declare module '@/src/context/SocketContext' {
  export const SocketProvider: React.FC<{ children: React.ReactNode }>;
  export const useSocket: () => any;
}

declare module '@/src/utils/errorMessages' {
  export const getAuthErrorMessage: (error: Error) => string;
  export const getPaymentErrorMessage: (error: Error) => string;
  export const getApiErrorMessage: (error: Error) => string;
}

declare module '@/src/screens/StudentDashboard' {
  const StudentDashboard: React.FC;
  export default StudentDashboard;
}

declare module '@/src/screens/WriterDashboard' {
  const WriterDashboard: React.FC;
  export default WriterDashboard;
}

declare module '@/src/screens/AudioCall' {
  const AudioCall: React.FC;
  export default AudioCall;
}
