import React, { useRef } from 'react';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MetricsData } from '../../../types/metricsTypes';
import { useDateContext } from '../../calendario/useDateContext';
import { MdBarChart } from "react-icons/md";

const fetchMetrics = async (page_id: string, startDate?: Date, endDate?: Date): Promise<MetricsData> => {
  const url = 'http://localhost:5000/api/facebook/facebook_metricas';
  const accessToken = Cookies.get('access_token');

  if (!accessToken) {
    throw new Error('No se encontró el token de acceso.');
  }

  const response = await axios.post<MetricsData>(
    url,
    {
      page_id,
      start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
      end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      withCredentials: true,
    }
  );

  if (response.data.error) {
    throw new Error(`Error del servidor: ${response.data.error}`);
  }

  return response.data;
};

interface AlcanceGraficoProps {
  theme: string;
  page_id?: string;
}

const AlcanceGrafico: React.FC<AlcanceGraficoProps> = ({ theme, page_id }) => {
  const chartRef = useRef<HTMLDivElement>(null); 
  const { dateRange } = useDateContext();

  const allCookies = Cookies.get();
  const selectedPageCookieKey = Object.keys(allCookies).find((key) =>
    key.startsWith('selected_page_')
  );
  const selectedPage = selectedPageCookieKey
    ? JSON.parse(allCookies[selectedPageCookieKey])
    : null;
  const currentPageId = page_id || selectedPage?.page_id;

  const { data: metricsData, isLoading, isError, error } = useQuery<MetricsData>({
    queryKey: ['facebookMetrics', currentPageId, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      if (!currentPageId) throw new Error('No se ha seleccionado una página de Facebook');
      return await fetchMetrics(currentPageId, dateRange.startDate ?? undefined, dateRange.endDate ?? undefined);
    },
    enabled: !!currentPageId,
    refetchInterval: 60000,
  });

  const alcancePorDia = metricsData?.Crecimiento?.['Alcance por Día']?.map((item: { date: string; value: number }) => ({
      date: new Date(item.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      }),
      reach: item.value,
    })) || [];
    const meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    return (
      <div
        className="flex flex-col md:flex-row w-full md:space-x-8 space-y-8 md:space-y-0"
        style={{ minHeight: '350px', maxWidth: '100%', margin: '0 auto' }}
      >
        <div ref={chartRef} className="w-full md:w-9/12 mt-5">
          {isLoading ? (
            <div className="flex justify-center items-center mt-4">
              <div className="loading loading-spinner loading-lg text-green-600"></div>
            </div>
          ) : isError ? (
            <div className="text-red-600 mt-4">
              Error al cargar las métricas: {(error as Error).message}
            </div>
          ) : (
            metricsData && (
              <ResponsiveContainer width="100%" height={350}>
                <LineChart
                  data={alcancePorDia}
                  margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={theme === 'dark' ? '#333' : '#eee'}
                  />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: theme === 'dark' ? '#fff' : '#000' }}
                    tickSize={12}
                    tickMargin={10}
                    axisLine={{ stroke: theme === 'dark' ? '#888' : '#ccc' }}
                  />
                  <YAxis
                    tick={{ fill: theme === 'dark' ? '#fff' : '#000' }}
                    axisLine={{ stroke: theme === 'dark' ? '#888' : '#ccc' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: theme === 'dark' ? '#333' : '#fff',
                      color: theme === 'dark' ? '#fff' : '#000',
                      borderRadius: 10,
                      boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)',
                      padding: 10,
                    }}
                    itemStyle={{
                      color: theme === 'dark' ? '#cce5ff' : '#5470c6',
                    }}
                    labelFormatter={(label) => `Fecha: ${label}`}
                    formatter={(value) => [`${value}`, 'Alcance']}
                  />
                  <Legend
                    verticalAlign="top"
                    align="center"
                    iconType="circle"
                    wrapperStyle={{
                      color: theme === 'dark' ? '#fff' : '#000',
                      marginBottom: 20,
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reach"
                    stroke="#fff700"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                    activeDot={{ r: 6 }}
                    animationDuration={1000}
                    name="Alcance"
                  />
                </LineChart>
              </ResponsiveContainer>
            )
          )}
        </div>
    
        <div className="flex p-4 mt-3 w-full md:w-4/12">
          <div className="p-4 space-y-4 w-full bg-transparent rounded-2xl text-black shadow-xl border border-gray-200">
          <h3 className="text-xl font-semibold flex items-center text-center">
            <MdBarChart className="text-2xl mr-2" />
            <strong className="font-bold">Desglose de Alcance</strong>
          </h3>

            <div>
              <p className="flex justify-between">
                <strong className='text-gray-700'>Total Alcance :</strong> 
                <strong className='text-xl'>{alcancePorDia.reduce((sum, item) => sum + item.reach, 0)}</strong>
              </p>
              <p className='flex justify-between'>
                <strong className='text-gray-700'>Promedio Diario :</strong> 
                <strong className='text-xl'>{(alcancePorDia.reduce((sum, item) => sum + item.reach, 0) / alcancePorDia.length).toFixed(0)}</strong>
              </p>
              <p><strong className='text-gray-700'>Cantidad por Día :</strong></p>
                <div className="mt-2 max-h-52 overflow-y-auto p-4 rounded-3xl shadow-inner border border-gray-200">
              
                  <ul>
                    {alcancePorDia.map((item, index) => {
                      const [day, month] = item.date.split('/').map((part) => parseInt(part, 10));

                      if (isNaN(day) || isNaN(month) || month < 1 || month > 12) {
                        return <li key={index}>Fecha inválida</li>;
                      }

                      const monthName = meses[month - 1];

                      return (
                        <li key={index} className="p-2 text-gray-600 font-medium py-1 hover:bg-gray-100 hover:text-black rounded-2xl transition-all duration-200 hover:scale-105 flex justify-between">
                          <span>{day} de {monthName}</span>
                          <span>{item.reach}</span>
                        </li>

                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>
          </div>
      </div>
    );
};

export default AlcanceGrafico;