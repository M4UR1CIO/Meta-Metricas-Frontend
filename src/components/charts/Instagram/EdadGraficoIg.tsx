import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import {
  PieChart,
  Pie,
  Sector,
  Cell,
  ResponsiveContainer,
} from 'recharts';
import { DemographicsData, MetricsData_ig } from '../../../types/metricsTypes';

const fetchFollowersCount = async (page_id: string): Promise<number> => {
  const url = `http://localhost:5000/api/instagram/instagram_metricas`;
  const csrfToken = Cookies.get('csrf_access_token');

  const response = await axios.post<MetricsData_ig>(
    url,
    { page_id },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
      },
      withCredentials: true,
    }
  );

  if (response.data.Totales) {
    return response.data.Totales['Total de Seguidores'];
  } else {
    throw new Error('No se pudo obtener el total de seguidores.');
  }
};

const fetchDemographics = async (page_id: string, metricType: string): Promise<DemographicsData> => {
  const url = `http://localhost:5000/api/demographics/instagram/demographics/${metricType}`;
  const csrfToken = Cookies.get('csrf_access_token');

  const response = await axios.post<DemographicsData>(
    url,
    { page_id },
    {
      headers: {
        'Content-Type': 'application/json',
        'X-CSRF-TOKEN': csrfToken || '',
      },
      withCredentials: true,
    }
  );

  if (response.data.demographics) {
    return response.data;
  } else {
    throw new Error(`Datos demográficos (${metricType}) no encontrados`);
  }
};

interface EdadGraficoIgProps {
  page_id: string;
}

const renderActiveShape = (props: any) => {
  const RADIAN = Math.PI / 180;
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    startAngle,
    endAngle,
    fill,
    payload,
    percent,
    value,
  } = props;
  const sin = Math.sin(-RADIAN * midAngle);
  const cos = Math.cos(-RADIAN * midAngle);
  const sx = cx + (outerRadius + 10) * cos;
  const sy = cy + (outerRadius + 10) * sin;
  const mx = cx + (outerRadius + 30) * cos;
  const my = cy + (outerRadius + 30) * sin;
  const ex = mx + (cos >= 0 ? 1 : -1) * 22;
  const ey = my;
  const textAnchor = cos >= 0 ? 'start' : 'end';

  return (
    <g>
      <text x={cx} y={cy} dy={8} textAnchor="middle" fill={fill}>
        {payload.name}
      </text>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
      <Sector
        cx={cx}
        cy={cy}
        startAngle={startAngle}
        endAngle={endAngle}
        innerRadius={outerRadius + 6}
        outerRadius={outerRadius + 10}
        fill={fill}
      />
      <path d={`M${sx},${sy}L${mx},${my}L${ex},${ey}`} stroke={fill} fill="none" />
      <circle cx={ex} cy={ey} r={2} fill={fill} stroke="none" />
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} textAnchor={textAnchor} fill="#333">{`PV ${value}`}</text>
      <text x={ex + (cos >= 0 ? 1 : -1) * 12} y={ey} dy={18} textAnchor={textAnchor} fill="#999">
        {`(Rate ${(percent * 100).toFixed(2)}%)`}
      </text>
    </g>
  );
};

const EdadGraficoIg: React.FC<EdadGraficoIgProps> = ({ page_id }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(0);

  const { data: followersCount = 0, isLoading: isLoadingFollowers, isError: isErrorFollowers, error: errorFollowers } =
    useQuery({
      queryKey: ['instagramFollowers', page_id],
      queryFn: async () => fetchFollowersCount(page_id),
      enabled: !!page_id,
    });

  const { data: ageData, isLoading: isLoadingDemographics, isError: isErrorDemographics, error: errorDemographics } =
    useQuery({
      queryKey: ['instagramAge', page_id],
      queryFn: async () => fetchDemographics(page_id, 'age'),
      enabled: followersCount !== null && followersCount >= 100,
    });

  const ageChartData = Object.entries(ageData?.demographics || {}).map(([key, value]) => ({
    name: key,
    value,
  }));

  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF'];

  if (isLoadingFollowers) {
    return (
      <div className="flex justify-center items-center mt-4">
        <div className="loading loading-spinner loading-lg text-green-600"></div>
      </div>
    );
  }

  if (isErrorFollowers) {
    return (
      <div className="text-red-600 mt-4">
        Error al obtener el total de seguidores: {errorFollowers?.message}
      </div>
    );
  }

  if (followersCount !== null && followersCount < 100) {
    return (
      <div className="text-red-600 mt-4 text-center font-semibold">
        Esta cuenta necesita más de 100 seguidores para mostrar los datos demográficos.
      </div>
    );
  }

  return (
    <div
      className="space-y-4 w-full"
      style={{ minHeight: '320px', maxWidth: '900px', margin: '0 auto' }}
    >
      {isLoadingDemographics ? (
        <div className="flex justify-center items-center mt-4">
          <div className="loading loading-spinner loading-lg text-green-600"></div>
        </div>
      ) : isErrorDemographics ? (
        <div className="text-red-600 mt-4">
          Error al cargar las métricas: {errorDemographics?.message}
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={440}>
          <PieChart>
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '16px', fontWeight: 'bold' }}
            >
              Edad
            </text>

            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={ageChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {ageChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default EdadGraficoIg;
