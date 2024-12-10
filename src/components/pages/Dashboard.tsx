import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import SeccionFB from './SeccionFB';
import SeccionIG from './SeccionIG';
import CerrarSesion from '../shared/Cuenta';
import SidebarMenu from '../menu/SidebarMenu';
import Reporte from '../../Reports/Reporte';
import DocumentationPage from '../../documentation/GuiaDeUso';
import Chatbot from '../../bot/Chatbot';
import { DateProvider } from '../calendario/DateContext';
import DateRangePicker from '../calendario/DateRangePicker';
import ToastError from '../toast/Toast';
import { showToastError } from '../toast/toastUtils';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>('guia');
  const [selectedSection, setSelectedSection] = useState<string>('guia');
  const [isMetricsVisible, setIsMetricsVisible] = useState(false);
  const [username, setUsername] = useState<string>('');
  const [theme, setTheme] = useState<string>('light');
  const [selectedPage, setSelectedPage] = useState<{ page_id: string; page_name: string; picture?: string } | null>(null);

  useEffect(() => {
    const accessToken = Cookies.get('access_token');
    if (!accessToken) {
      navigate('/');
    } else {
      const base64Url = accessToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      const decodedPayload = JSON.parse(jsonPayload);
      setUsername(decodedPayload.sub);

      const savedPlatform = Cookies.get('selected_platform') || 'guia';
      setSelectedPlatform(savedPlatform);
      setSelectedSection(
        savedPlatform === 'reportes'
          ? 'reportes'
          : savedPlatform === 'guia'
          ? 'guia'
          : 'metrics'
      );
      setIsMetricsVisible(savedPlatform !== 'guia');
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.add(savedTheme);
    }

    const selectedPageId = Cookies.get('Plataforma_Select');
    if (selectedPageId) {
      const pageCookieKey = `selected_page_${selectedPageId}`;
      const pageData = Cookies.get(pageCookieKey);

      if (pageData) {
        const parsedPage = JSON.parse(pageData);
        setSelectedPage(parsedPage);
      }
    }
  }, [navigate]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    localStorage.setItem('theme', newTheme);
  };

  const handlePlatformSelect = (platform: string) => {
    if (!selectedPage && (platform === 'facebook' || platform === 'instagram' || platform === 'reportes')) {
      showToastError('Debes seleccionar una página antes de acceder a esta sección.');
      return;
    }

    if (platform === 'reportes') {
      setSelectedSection('reportes');
      setSelectedPlatform('reportes');
    } else if (platform === 'guia') {
      setSelectedSection('guia');
      setSelectedPlatform('guia');
    } else {
      setSelectedPlatform(platform);
      setSelectedSection('metrics');
    }
    setIsMetricsVisible(platform !== 'guia');
    Cookies.set('selected_platform', platform, { expires: 1 });
  };

  const updateSelectedPage = (pageId: string, pageName: string, businessAccountId: string | null, picture?: string) => {
    const cookieName = `selected_page_${pageId}`;
    const pageData = { page_id: pageId, page_name: pageName, business_account_id: businessAccountId, picture };
    setSelectedPage(pageData);
    Cookies.set(cookieName, JSON.stringify(pageData), { expires: 7 });
  };

  const handleNavigateCommand = (platform: string) => {
    if (!selectedPage && (platform === 'facebook' || platform === 'instagram' || platform === 'reportes')) {
      showToastError('Debes seleccionar una página antes de acceder a esta sección.');
      return;
    }

    if (platform === 'facebook' || platform === 'instagram') {
      setSelectedPlatform(platform);
      setSelectedSection('metrics');
    } else if (platform === 'reportes') {
      setSelectedPlatform('reportes');
      setSelectedSection('reportes');
    } else if (platform === 'guia') {
      setSelectedPlatform('guia');
      setSelectedSection('guia');
    }
    setIsMetricsVisible(platform !== 'guia');
    Cookies.set('selected_platform', platform, { expires: 1 });
  };

  return (
    <DateProvider>
      <div className={`min-h-screen flex ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gradient-to-r from-blue-50 to-indigo-50'}`}>
        <ToastError />
        <div className="fixed top-0 left-0 h-screen w-68 bg-white z-50">
          <SidebarMenu
            onPlatformSelect={handlePlatformSelect}
            theme={theme}
            selectedPlatform={selectedPlatform}
          />
        </div>

        <div className="flex-grow ml-0 md:ml-56 overflow-y-auto">
          <div className="p-4 space-y-6">
            <div className="flex items-center justify-between mb-4 w-full">
              <div className="text-lg md:text-2xl font-semibold text-center md:text-left hidden sm:block">
                {selectedPage ? `${selectedPage.page_name}` : 'Selecciona una Página'}
              </div>
              <div className="flex-grow"></div>
              {isMetricsVisible && (selectedPlatform === 'facebook' || selectedPlatform === 'instagram' || selectedPlatform === 'reportes') && (
                <DateRangePicker />
              )}
              <CerrarSesion username={username} toggleTheme={toggleTheme} theme={theme} setSelectedPage={updateSelectedPage} selectedPage={selectedPage} />
            </div>

            {isMetricsVisible && selectedPlatform === 'facebook' && selectedSection === 'metrics' && selectedPage && (
              <SeccionFB theme={theme} selectedPage={selectedPage} />
            )}

            {isMetricsVisible && selectedPlatform === 'instagram' && selectedSection === 'metrics' && selectedPage && (
              <SeccionIG theme={theme} selectedPage={selectedPage} />
            )}

            {isMetricsVisible && selectedSection === 'reportes' && selectedPage && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className={`shadow-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} w-full`}>
                <Reporte selectedPage={selectedPage} theme={theme} />
              </motion.div>
            )}

            {selectedSection === 'guia' && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className={`shadow-lg rounded-lg p-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} w-full`}
              >
                <DocumentationPage />
              </motion.div>
            )}
          </div>
          <Chatbot onNavigateCommand={handleNavigateCommand} />
        </div>
      </div>
    </DateProvider>
  );
};

export default Dashboard;
