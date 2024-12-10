import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import axios from 'axios';
import { FaThumbsUp, FaEye, FaUser } from 'react-icons/fa';
import { MetricsData_ig } from '../../types/metricsTypes';
import { useDateContext } from '../calendario/useDateContext';

interface MetricsButtonsProps {
  selectedPageId: string;
  onLoad?: () => void;
}

const fetchMetrics = async (
  token: string,
  pageId: string,
  startDate?: Date,
  endDate?: Date
): Promise<MetricsData_ig> => {
  const url = 'http://localhost:5000/api/instagram/instagram_metricas';
  try {
    const response = await axios.post(
      url,
      {
        page_id: pageId,
        start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
        end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        withCredentials: true,
      }
    );
    if (response.data.error) throw new Error(response.data.error);
    return response.data;
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response) {
      console.error('Error en respuesta del backend:', error.response.data);
      throw new Error(error.response.data?.error || 'Error desconocido del backend.');
    } else if (error instanceof Error) {
      console.error('Error en la solicitud de métricas:', error.message);
      throw new Error(error.message);
    } else {
      throw new Error('Error desconocido al obtener las métricas.');
    }
  }
};

const MetricsButtons_ig: React.FC<MetricsButtonsProps> = ({ selectedPageId, onLoad }) => {
  const [totalSeguidores, setTotalSeguidores] = useState(0);
  const [totalPublicaciones, setTotalPublicaciones] = useState(0);
  const [totalAlcance, setTotalAlcance] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { dateRange } = useDateContext(); 

  useEffect(() => {
    const fetchData = async () => {
      const token = Cookies.get('access_token');

      if (token) {
        try {
          const metricsData = await fetchMetrics(
            token,
            selectedPageId,
            dateRange.startDate ?? undefined,
            dateRange.endDate ?? undefined
          );
          setTotalAlcance(metricsData?.Totales['Total de Alcance'] || 0);
          setTotalSeguidores(metricsData?.Totales['Total de Seguidores'] || 0);
          setTotalPublicaciones(metricsData?.Totales['Total de Publicaciones'] || 0);
        } catch (fetchError: unknown) {
          if (axios.isAxiosError(fetchError) && fetchError.response) {
            console.error("Error al obtener métricas desde el backend:", fetchError.response.data);
            setError(fetchError.response.data?.error || "Error desconocido del backend.");
          } else if (fetchError instanceof Error) {
            console.error("Error en la solicitud de métricas:", fetchError.message);
            setError(fetchError.message);
          } else {
            setError("Error desconocido al obtener las métricas.");
          }
        } finally {
          if (onLoad) {
            onLoad();
          }
        }
      } else {
        setError('No se encontró el token de acceso. Por favor, inicie sesión de nuevo.');
      }
    };

    fetchData();
  }, [selectedPageId, dateRange.startDate, dateRange.endDate, onLoad]); // Dependencias incluyen fechas del contexto

  if (error) {
    return <div className="text-center text-red-600">{error}</div>;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-8 w-full animate-fadeIn">
      <div className="p-4 w-full h-20 rounded-3xl bg-blue-100 shadow-sm flex justify-between items-center transition-transform transform hover:scale-105">
        <div className="flex flex-col justify-center">
          <h3 className="text-xl font-medium text-gray-700">Contenido Total</h3>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-bold text-black">{totalPublicaciones}</p>
          </div>
        </div>
        <FaEye className="text-3xl text-blue-400" />
      </div>

      <div className="p-4 w-full h-20 rounded-3xl bg-blue-100 shadow-sm flex justify-between items-center transition-transform transform hover:scale-105">
        <div className="flex flex-col justify-center">
          <h3 className="text-xl font-medium text-gray-700">Alcance</h3>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-bold text-black">{totalAlcance}</p>
          </div>
        </div>
        <FaThumbsUp className="text-3xl text-blue-400" />
      </div>

      <div className="p-4 w-full h-20 rounded-3xl bg-blue-100 shadow-sm flex justify-between items-center transition-transform transform hover:scale-105">
        <div className="flex flex-col justify-center">
          <h3 className="text-xl font-medium text-gray-700">Seguidores</h3>
          <div className="flex items-baseline space-x-1">
            <p className="text-3xl font-bold text-black">{totalSeguidores}</p>
          </div>
        </div>
        <FaUser className="text-3xl text-blue-400" />
      </div>
    </div>
  );
};

export default MetricsButtons_ig;
