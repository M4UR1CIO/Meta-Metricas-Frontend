import React, { useEffect, useState } from 'react';
import Vivus from 'vivus';
import Cookies from 'js-cookie';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaBook, FaSignOutAlt, FaChartBar, FaBars } from 'react-icons/fa';
import { FacebookPage } from '../../types/metricsTypes';

interface SidebarMenuProps {
  onPlatformSelect: (platform: string) => void;
  theme: string;
  selectedPlatform: string | null; // Recibe el estado actual desde el Dashboard
}

const SidebarMenu: React.FC<SidebarMenuProps> = ({ onPlatformSelect, theme, selectedPlatform }) => {
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Inicializa la animación del botón de logout
    new Vivus('logout-icon', { type: 'sync', duration: 50, animTimingFunction: Vivus.EASE });

    // Carga las páginas de Facebook al cargar el componente
    fetchFacebookPages();
  }, []);

  const fetchFacebookPages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cuenta/cuentas_paginas', {
        withCredentials: true,
      });
      const pages = response.data.Paginas || [];
      setFacebookPages(pages);
    } catch (error) {
      console.error('Error al obtener las páginas de Facebook:', error);
    }
  };

  const handlePlatformSelect = (platform: string) => {
    Cookies.set('selected_platform', platform, { expires: 1 }); // Guarda la selección en una cookie
    onPlatformSelect(platform); // Notifica al componente padre (Dashboard)
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false); // Cierra el sidebar en pantallas pequeñas
    }
  };

  const handleLogout = async () => {
    try {
      const response = await axios.post('http://localhost:5000/api/auth/logout');
      if (response.status === 200) {
        Cookies.remove('access_token');
        Cookies.remove('csrf_access_token');
        Cookies.remove('access_token_cookie');
        Cookies.remove('selected_platform');
        facebookPages.forEach((page) => {
          Cookies.remove(`selected_page_${page.id}`);
        });
        navigate('/');
      }
    } catch (error) {
      console.error('Error al hacer logout:', error);
    }
  };

  const handleGuideClick = () => {
    handlePlatformSelect('guia'); // Selección para la guía
  };

  return (
    <>
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="fixed top-5 left-2 z-50 md:hidden text-white bg-blue-500 p-3 rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-400"
      >
        <FaBars />
      </button>

      <AnimatePresence>
        {(isSidebarOpen || window.innerWidth >= 768) && (
          <motion.div
            initial={{ x: -300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -300, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 70, damping: 15 }}
            className={`fixed md:relative md:top-0 md:left-0 h-screen w-[60%] sm:w-[30%] md:w-[260px] shadow-xl p-4 z-40 ${
              theme === 'dark'
                ? 'bg-gradient-to-b from-purple-700 via-pink-700 to-blue-700 text-white'
                : 'bg-gradient-to-b from-indigo-200 to-blue-300 text-gray-800'
            } flex flex-col justify-between`}
            style={{
              borderTopRightRadius: '30px',
              borderBottomRightRadius: '30px',
              borderTopLeftRadius: '0',
              borderBottomLeftRadius: '0',
              transition: 'background-color 0.3s ease, color 0.3s ease',
            }}
          >
            <div>
              <div className="text-2xl font-bold py-4 flex items-center justify-center opacity-90 text-white mb-8">
                Meta
              </div>

              <div className="space-y-4">
                <div
                  onClick={() => handlePlatformSelect('facebook')}
                  className={`flex items-center py-2 px-4 rounded-full cursor-pointer transition-all duration-500 ${
                    selectedPlatform === 'facebook'
                      ? 'bg-blue-100 text-blue-800 font-semibold'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <FaFacebook className="mr-3" />
                  <span className="text-lg">Facebook</span>
                </div>

                <div
                  onClick={() => handlePlatformSelect('instagram')}
                  className={`flex items-center py-2 px-4 rounded-full cursor-pointer transition-all duration-500 ${
                    selectedPlatform === 'instagram'
                      ? 'bg-pink-100 text-pink-800 font-semibold'
                      : 'hover:bg-white/20 text-white'
                  }`}
                >
                  <FaInstagram className="mr-3" />
                  <span className="text-lg">Instagram</span>
                </div>

                <div
  onClick={() => handlePlatformSelect("reportes")} // Cambiar a "reportes"
  className={`flex items-center py-2 px-4 rounded-full cursor-pointer transition-all duration-500 ${
    selectedPlatform === "reportes" ? "bg-green-100 text-green-800 font-semibold" : "hover:bg-white/20 text-white"
  }`}
>
  <FaChartBar className="mr-3" />
  <span className="text-lg">Reportes</span>
</div>

              </div>
            </div>

            {/* Bottom actions */}
            <div className="space-y-4 mt-12">
              <div
                onClick={handleGuideClick}
                className="flex items-center py-3 px-4 text-white cursor-pointer hover:bg-white/20 transition-all duration-500 rounded-full"
              >
                <FaBook className="mr-3" />
                <div>
                  <span className="block font-semibold text-lg">Guía de uso</span>
                  <span className="text-sm text-white/80">Documentación</span>
                </div>
              </div>

              {/* Botón de Cerrar Sesión */}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center py-3 px-4 rounded-full bg-red-500 text-white font-bold transition-all duration-500 hover:bg-red-600 w-full"
              >
                <FaSignOutAlt id="logout-icon" className="mr-3" />
                Cerrar sesión
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SidebarMenu;
