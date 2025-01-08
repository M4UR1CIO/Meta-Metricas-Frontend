import React, { useState } from 'react';
import Cookies from 'js-cookie';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from 'recharts';
import countries from 'i18n-iso-countries';
import es from 'i18n-iso-countries/langs/es.json';
import { DemographicsCountryData, MetricsData } from '../../../types/metricsTypes';

countries.registerLocale(es);

type ProcessedData = {
  top: { name: string; value: number }[];
  others: { name: string; value: number };
};

const fetchFollowersCount = async (page_id: string): Promise<number> => {
  const url = `http://localhost:5000/api/facebook/facebook_metricas`;
  const csrfToken = Cookies.get('csrf_access_token');

  const response = await axios.post<MetricsData>(
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

  if (response.data.error) {
    throw new Error(response.data.error);
  }

  return response.data.Totales['Total de Seguidores'];
};

const fetchCountryDemographics = async (page_id: string): Promise<DemographicsCountryData> => {
  const url = `http://localhost:5000/api/demographicsfb/facebook/demographics/country`;
  const csrfToken = Cookies.get('csrf_access_token');

  const response = await axios.post<DemographicsCountryData>(
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
    throw new Error('Datos demográficos no encontrados');
  }
};

interface CountryGraphProps {
  page_id: string;
}

const CountryGraph: React.FC<CountryGraphProps> = ({ page_id }) => {
  const [activeIndex, setActiveIndex] = useState<number | undefined>(0);

  const { data: followersCount = 0, isLoading: isLoadingFollowers, isError: isErrorFollowers, error: errorFollowers } =
    useQuery({
      queryKey: ['facebookFollowers', page_id],
      queryFn: async () => fetchFollowersCount(page_id),
      enabled: !!page_id,
    });

  const { data: countryData, isLoading: isLoadingDemographics, isError: isErrorDemographics, error: errorDemographics } =
    useQuery({
      queryKey: ['facebookCountry', page_id],
      queryFn: async () => fetchCountryDemographics(page_id),
      enabled: followersCount !== null && followersCount >= 100,
    });

  const processedCountryData = Object.entries(countryData?.demographics[0]?.value || {})
    .map(([key, value]) => ({
      name: countries.getName(key, 'es') || key, // Convertir código de país a nombre
      value,
    }))
    .sort((a, b) => b.value - a.value) // Ordenar por valor descendente
    .reduce<ProcessedData>(
      (acc, current, index) => {
        if (index < 3) {
          acc.top.push(current);
        } else {
          acc.others.value += current.value;
        }
        return acc;
      },
      { top: [], others: { name: 'Otros', value: 0 } }
    );

  const countryChartData = [...processedCountryData.top, processedCountryData.others];

  const COLORS = ['#FF6384', '#36A2EB', '#FFCE56', '#CCCCCC'];

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
      style={{ minHeight: '300px', maxWidth: '900px', margin: '0 auto' }}
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
        <ResponsiveContainer width="100%" height={405}>
          <PieChart>
            <text
              x="50%"
              y="45%"
              textAnchor="middle"
              dominantBaseline="middle"
              style={{ fontSize: '18px', fontWeight: 'bold' }}
            >
              País
            </text>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={countryChartData}
              cx="50%"
              cy="50%"
              innerRadius={80}
              outerRadius={110}
              fill="#8884d8"
              dataKey="value"
              onMouseEnter={(_, index) => setActiveIndex(index)}
            >
              {countryChartData.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        
      )}
    </div>
  );
};

export default CountryGraph;
