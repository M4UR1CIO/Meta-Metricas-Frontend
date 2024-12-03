import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register'; // Importa el componente de registro
import Dashboard from './components/Dashboard';
import Error404 from './components/404/Error404';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Cookies from 'js-cookie';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { ChatProvider } from './context/ChatContext';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }: { children: JSX.Element }) => {
  const token = Cookies.get('access_token');

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ChatProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/register" element={<Register />} /> {/* Ruta de registro */}
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="*" element={<Error404 />} />
          </Routes>

          <ToastContainer
            position="top-right"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
          />
        </Router>
      </ChatProvider>
    </QueryClientProvider>
  );
};

export default App;
