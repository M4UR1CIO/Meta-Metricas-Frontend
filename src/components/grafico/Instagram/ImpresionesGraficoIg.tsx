import React from 'react';
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
import { MetricsData_ig } from '../../../types/metricsTypes';
import { useDateContext } from '../../calendario/useDateContext';

const fetchMetrics = async (page_id: string, startDate?: Date, endDate?: Date): Promise<MetricsData_ig> => {
  const url = 'http://localhost:5000/api/instagram/instagram_metricas';
  const csrfToken = Cookies.get('csrf_access_token');

  const response = await axios.post<MetricsData_ig>(
    url,
    { 
      page_id,
      start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
      end_date: endDate ? endDate.toISOString().split('T')[0] : undefined,
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
      },
      withCredentials: true,
    }
  );

  if (response.data.error) {
    throw new Error(`Error del servidor: ${response.data.error}`);
  }

  return response.data;
};

interface ImpresionesGraficoIgProps {
  theme: string;
  page_id?: string;
}

const ImpresionesGraficoIg: React.FC<ImpresionesGraficoIgProps> = ({ theme, page_id }) => {
  const { dateRange } = useDateContext(); 
  const allCookies = Cookies.get();
  const selectedPageCookieKey = Object.keys(allCookies).find((key) =>
    key.startsWith('selected_page_')
  );
  const selectedPage = selectedPageCookieKey
    ? JSON.parse(allCookies[selectedPageCookieKey])
    : null;
  const currentPageId = page_id || selectedPage?.page_id;

  const { data: metricsData, isLoading, isError, error } = useQuery<MetricsData_ig>({
    queryKey: ['instagramMetrics', currentPageId, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      if (!currentPageId) throw new Error('No se ha seleccionado una cuenta de Instagram');
      return await fetchMetrics(
        currentPageId, 
        dateRange.startDate ?? undefined, 
        dateRange.endDate ?? undefined
      );
    },
    enabled: !!currentPageId,
    refetchInterval: 60000,
  });

  const impresionesPorDia = metricsData?.Crecimiento['Impresiones por Día']?.map((item) => ({
    date: new Date(item.date).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
    }),
    reach: item.value,
  })) || [];

  return (
    <div
      className="space-y-4 w-full"
      style={{ minHeight: '320px', maxWidth: '900px', margin: '0 auto' }}
    >
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
              data={impresionesPorDia}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
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
                labelFormatter={(label) => `Fecha: ${label}`}
                formatter={(value) => [`${value}`, 'Impresiones']}
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
                stroke="#FF5733"
                strokeWidth={3}
                dot={{ r: 3 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
                name="Impresiones"
              />
            </LineChart>
          </ResponsiveContainer>
        )
      )}
    </div>
  );
};

export default ImpresionesGraficoIg;
