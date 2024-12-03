import React, { useEffect, useState } from 'react';
import Vivus from 'vivus';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FacebookPage } from '../../types/metricsTypes';
import { motion, AnimatePresence } from 'framer-motion';
import ActualizarCuenta from '../ActualizarCuenta';

interface CuentaProps {
  username: string;
  toggleTheme: () => void;
  theme: string;
  setSelectedPage: (pageId: string, pageName: string, businessAccountId: string | null, picture?: string) => void;
  selectedPage: { page_id: string; page_name: string; picture?: string } | null;
}

const Cuenta: React.FC<CuentaProps> = ({ username, toggleTheme, theme, setSelectedPage, selectedPage }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [facebookPages, setFacebookPages] = useState<FacebookPage[]>([]);
  const [mostrarActualizarCuenta, setMostrarActualizarCuenta] = useState(false);

  useEffect(() => {
    console.log("Componente montado");
    new Vivus('user-icon', { type: 'sync', duration: 50, animTimingFunction: Vivus.EASE });
    fetchFacebookPages();
  }, []);

  const fetchFacebookPages = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/cuenta/cuentas_paginas', {
        withCredentials: true,
      });
      setFacebookPages(response.data.Paginas || []);
    } catch (error) {
      console.error("Error al obtener las páginas de Facebook:", error);
    }
  };

  const handlePageSelect = (page: FacebookPage) => {
    Cookies.set('Plataforma_Select', page.id, { expires: 7 });
    const cookieName = `selected_page_${page.id}`;
    Cookies.set(cookieName, JSON.stringify({
      page_id: page.id,
      page_name: page.name,
      picture: page.picture,
      business_account_id: page.business_account_id 
    }), { expires: 7 });
    setSelectedPage(page.id, page.name, page.business_account_id, page.picture);
    setIsDropdownOpen(false);
  };

  return (
    <div className="relative z-50">
      <div
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className={`flex items-center space-x-2 cursor-pointer ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'} rounded-lg p-2 shadow-md`}
      >
        {selectedPage && selectedPage.picture ? (
          <img src={selectedPage.picture} alt={selectedPage.page_name} className="w-8 h-8 rounded-full" />
        ) : (
          <svg
            id="user-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            width="24"
            height="24"
            className={`stroke-current ${theme === 'dark' ? 'text-white' : 'text-black'}`}
          >
            <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
            <path d="M4 20c0-4 4-8 8-8s8 4 8 8" stroke="currentColor" strokeWidth="2" fill="none" />
          </svg>
        )}
        <span>{selectedPage ? selectedPage.page_name : username}</span>
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.ul
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className={`absolute mt-2 right-0 w-60 p-4 shadow-lg rounded-lg ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white text-black'}`}
          >
            <p className="font-semibold text-base mb-2">Cuentas conectadas:</p>
            {facebookPages.map((page) => (
              <motion.li
                key={page.id}
                className="flex items-center space-x-3 cursor-pointer px-4 py-2 rounded-lg transition duration-300 hover:bg-gray-100"
                onClick={() => handlePageSelect(page)}
                whileHover={{ scale: 1.05 }}
              >
                <img src={page.picture} alt={page.name} className="w-8 h-8 rounded-full" />
                <span className="text-sm font-medium">{page.name}</span>
              </motion.li>
            ))}
            <li
              className="cursor-pointer px-4 py-2 rounded-lg transition duration-300 hover:bg-gray-100"
              onClick={() => setMostrarActualizarCuenta(true)}
            >
              Actualizar Cuenta
            </li>
            <li>
              <a onClick={toggleTheme} className="flex items-center space-x-2 mt-4 cursor-pointer">
                <svg
                  id="theme-icon"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  className="stroke-current"
                >
                  {theme === 'light' ? (
                    <path
                      d="M12 4V2m0 20v-2M5.64 5.64L4.22 4.22M19.78 19.78l-1.42-1.42M18 12h2M2 12h2m14.36-6.36L19.78 4.22M4.22 19.78l1.42-1.42M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  ) : (
                    <path
                      d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                      stroke="currentColor"
                      strokeWidth="2"
                      fill="none"
                    />
                  )}
                </svg>
                <span>{theme === 'light' ? 'Cambiar a tema oscuro' : 'Cambiar a tema claro'}</span>
              </a>
            </li>
          </motion.ul>
        )}
      </AnimatePresence>

      {mostrarActualizarCuenta && (
        <ActualizarCuenta
          username={username}
          onClose={() => setMostrarActualizarCuenta(false)}
        />
      )}
    </div>
  );
};

export default Cuenta;
