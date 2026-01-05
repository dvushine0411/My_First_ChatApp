import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import SignInPage from './Pages/SignInPage';
import SignUpPage from './Pages/SignUpPage';
import ChatAppPage from './Pages/ChatAppPage';
import { Toaster } from 'sonner';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { useAuthStore } from './stores/useAuthStore';
import { useThemeStore } from './stores/useThemeStore';
import { useEffect } from 'react';
import { useSocketStore } from './stores/useSocketStores';

function App() {
  const {accessToken} = useAuthStore();
  const{connectSocket, disconnectSocket} = useSocketStore();


  const {isDark, setTheme} = useThemeStore();

  useEffect(() => {
    setTheme(isDark);
  }, [isDark]);

  useEffect(() => {
    if(accessToken)
    {
       connectSocket();
    }

    return () => disconnectSocket();
    
  },[accessToken])

  return (
    <>
    <Toaster richColors />  
    <BrowserRouter>
      <Routes>

        {/* Public Route */}
        <Route 
          path="/signin" 
          element={<SignInPage />} />

        <Route 
          path="/signup" 
          element={<SignUpPage />} /> 

        {/* Protected Route */}

        <Route element={<ProtectedRoute/>}>
          <Route  
          path="/" 
          element={accessToken ? <ChatAppPage />: <Navigate to="/signin"/>} 
          />
        </Route>

      </Routes>
    </BrowserRouter>
    </>
  );
}

export default App;