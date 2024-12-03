import React, { useEffect } from 'react';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { MetricsData } from '../../../types/metricsTypes';
import { useDateContext } from '../../calendario/useDateContext';

const fetchMetrics = async (page_id: string, startDate?: Date, endDate?: Date): Promise<MetricsData> => {
  const url = 'http://localhost:5000/api/facebook/facebook_metricas';
  const csrfToken = Cookies.get('csrf_access_token');

  const response = await axios.post(
    url,
    { 
      page_id, 
      start_date: startDate ? startDate.toISOString().split('T')[0] : undefined,
      end_date: endDate ? endDate.toISOString().split('T')[0] : undefined 
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

interface LikePaginaGraficoProps {
  theme: string;
  page_id?: string;
  onLoad?: () => void;
}

const LikePaginaGrafico: React.FC<LikePaginaGraficoProps> = ({ theme, page_id, onLoad }) => {
  const { dateRange } = useDateContext();

  const allCookies = Cookies.get();
  const selectedPageCookieKey = Object.keys(allCookies).find((key) =>
    key.startsWith('selected_page_')
  );
  const selectedPage = selectedPageCookieKey
    ? JSON.parse(allCookies[selectedPageCookieKey])
    : null;
  const currentPageId = page_id || selectedPage?.page_id;

  const { data: metricsData, isError, isLoading } = useQuery<MetricsData>({
    queryKey: ['facebookMetrics', currentPageId, dateRange.startDate, dateRange.endDate],
    queryFn: async () => {
      if (!currentPageId) throw new Error('No se ha seleccionado una página de Facebook');
      return await fetchMetrics(currentPageId, dateRange.startDate ?? undefined, dateRange.endDate ?? undefined);
    },
    enabled: !!currentPageId,
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isLoading && onLoad) {
      onLoad();
    }
  }, [isLoading, onLoad]);

  const chartData =
    metricsData?.Crecimiento['Me gusta por Día']?.map((item) => ({
      date: new Date(item.date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: '2-digit',
      }),
      likes: item.value,
    })) || [];

  return (
    <div
      className="space-y-4 w-full"
      style={{ minHeight: '320px', maxWidth: '900px', margin: '0 auto' }}
    >
      {isError ? (
        <div className="text-red-600 mt-4">
          Error al cargar las métricas. Inténtalo de nuevo más tarde.
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
                itemStyle={{
                  color: theme === 'dark' ? '#cce5ff' : '#5470c6',
                }}
                labelFormatter={(label) => `Fecha: ${label}`}
                formatter={(value) => [`${value} likes`, 'Me gusta']}
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
              <Bar
                dataKey="likes"
                fill="#29B3C8"
                barSize={30}
                radius={[10, 10, 0, 0]}
                animationDuration={1000}
                name="Me gusta (Pagina)"
              />
            </BarChart>
          </ResponsiveContainer>
        )
      )}
    </div>
  );
};

export default LikePaginaGrafico;
