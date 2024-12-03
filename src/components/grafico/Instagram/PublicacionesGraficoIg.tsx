import React, {useRef} from 'react';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { MetricsData_ig } from '../../../types/metricsTypes';
import { useDateContext } from '../../calendario/useDateContext';

const fetchInstagramMetrics = async (page_id: string, startDate?: Date, endDate?: Date): Promise<MetricsData_ig> => {
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

  console.log("Datos obtenidos del backend:", response.data);
  if (response.data.error) {
    throw new Error(`Error del servidor: ${response.data.error}`);
  }

  return response.data;
};

interface PublicacionesGraficoIgProps {
  theme: string;
  page_id?: string;
}

const PublicacionesGraficoIg: React.FC<PublicacionesGraficoIgProps> = ({ theme, page_id }) => {
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

  const { data: metricsData, isLoading, isError, error } = useQuery<MetricsData_ig>({
    queryKey: ['instagramMetrics', currentPageId, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      if (!currentPageId) throw new Error('No se ha seleccionado una cuenta de Instagram');
      return await fetchInstagramMetrics(currentPageId, dateRange.startDate ?? undefined, dateRange.endDate ?? undefined);
    },
    enabled: !!currentPageId,
    refetchInterval: 60000,
  });

  const publicacionesPorDia = metricsData?.Crecimiento['Publicaciones por Día'] || [];

  const chartData = (() => {
    const postsByDate: { [key: string]: { posts: number; comments: number; shares: number } } = {};

    publicacionesPorDia.forEach((item) => {
      const formattedDate = new Date(item.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'UTC', // Usar UTC para evitar desajustes
      });
    
      postsByDate[formattedDate] = {
        posts: item.posts || 0,
        comments: item.comments || 0,
        shares: item.shares || 0,
      };
    });
    

    const startDate = dateRange.startDate || new Date(Date.now() - 27 );
    const endDate = dateRange.endDate || new Date();

    const dateRangeArray = [];
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const formattedDate = currentDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      });
      dateRangeArray.push({
        date: formattedDate,
        posts: postsByDate[formattedDate]?.posts || 0,
        comments: postsByDate[formattedDate]?.comments || 0,
        shares: postsByDate[formattedDate]?.shares || 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dateRangeArray;
  })();

  return (
    <div
      ref={chartRef}
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
            <BarChart
              data={chartData}
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
                formatter={(value, name) => [`${value}`, name]}
              />
              <Legend
                verticalAlign="top"
                align="center"
                iconType="circle"
                wrapperStyle={{
                  color: theme === 'dark' ? '#fff' : '#000',
                  marginBottom: 20,
                }}
                payload={[
                    {
                      value: 'Publicaciones',
                      type: 'circle',
                      color: theme === 'dark' ? '#8884d8' : '#CD9733',
                    },
                  ]}
              />
              <Bar
                dataKey="posts"
                stackId="a"
                fill={theme === 'dark' ? '#8884d8' : '#CD9733'}
                name="Publicaciones"
              />
              <Bar
                dataKey="comments"
                stackId="a"
                fill={theme === 'dark' ? '#ffc658' : '#ff7300'}
                name="Comentarios"
                legendType="none"
              />
              <Bar
                dataKey="shares"
                stackId="a"
                fill={theme === 'dark' ? '#82ca9d' : '#8884d8'}
                name="Compartidos"
                legendType="none"
              />
            </BarChart>
          </ResponsiveContainer>
        )
      )}
    </div>
  );
};

export default PublicacionesGraficoIg;
