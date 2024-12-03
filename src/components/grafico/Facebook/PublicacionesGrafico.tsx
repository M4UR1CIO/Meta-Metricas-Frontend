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
import { MetricsData } from '../../../types/metricsTypes';
import { useDateContext } from '../../calendario/useDateContext';

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
      end_date: endDate ? endDate.toISOString().split('T')[0] : undefined 
    },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
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

interface PublicacionesGraficoProps {
  theme: string;
  page_id?: string;
}

const PublicacionesGrafico: React.FC<PublicacionesGraficoProps> = ({ theme, page_id }) => {
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

  const publicacionesConEngagement = (() => {
  const posts = metricsData?.Actividad['Publicaciones con Engagement'] || [];
  const postsByDate: { [key: string]: { posts: number; comments: number; shares: number } } = {};

  const startDate = dateRange.startDate || new Date(Date.now() - 27);
  const endDate = dateRange.endDate || new Date();

  posts.forEach((post) => {
    const postDate = new Date(post.created_time);

    // Filtrar posts dentro del rango exacto de fechas
    if (postDate >= startDate && postDate <= endDate) {
      const formattedDate = postDate.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
        timeZone: 'UTC',
      });
      if (!postsByDate[formattedDate]) {
        postsByDate[formattedDate] = { posts: 0, comments: 0, shares: 0 };
      }
      postsByDate[formattedDate].posts += 1;
      postsByDate[formattedDate].comments += post.comments;
      postsByDate[formattedDate].shares += post.shares;
    }
  });

  // Generar las fechas exactas dentro del rango y construir los datos de la gráfica
  const dateRangeArray = [];
  const currentDate = new Date(startDate);

  // Iterar y construir el array del eje X dentro del rango exacto
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
              data={publicacionesConEngagement}
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
                domain={[0, Math.max(
                  ...publicacionesConEngagement.map((d) => d.posts + d.comments + d.shares)
                )]} // Ajusta el rango dinámicamente
                ticks={
                  Array.from({ 
                    length: Math.max(...publicacionesConEngagement.map((d) => d.posts + d.comments + d.shares)) + 1 
                  }, (_, i) => i)
                } // Genera números del 0 al máximo valor
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

export default PublicacionesGrafico;
