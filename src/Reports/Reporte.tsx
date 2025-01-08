import React, { useState, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import { HiOutlineDocumentReport } from 'react-icons/hi';
import ReportSkeleton from '../components/skeletons/ReportSkeleton';
import Cookies from 'js-cookie';
import { MetricsData, MetricsData_ig } from '../types/metricsTypes';
import { Canvg } from 'canvg';
import AlcanceGrafico from '../components/charts/Facebook/AlcanceGrafico';
import AlcanceGraficoIg from '../components/charts/Instagram/AlcanceGraficoIg';
import VisitasGrafico from '../components/charts/Facebook/VisitasGrafico';
import PublicacionesGrafico from '../components/charts/Facebook/PublicacionesGrafico';
import PublicacionesGraficoIg from '../components/charts/Instagram/PublicacionesGraficoIg';
import VideoGrafico from '../components/charts/Facebook/VideoGrafico';
import Video30sGrafico from '../components/charts/Facebook/Video30sGrafico';
import { useDateContext } from '../components/calendario/useDateContext';
import CombinedTopReachPostsTable from '../components/charts/Instagram/TopGraficReach';
import { toPng } from "html-to-image";

interface ReporteProps {
  selectedPage: { page_id: string; page_name: string } | null;
  theme: string;
}

const Reporte: React.FC<ReporteProps> = ({ selectedPage, theme }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const [facebookMetrics, setFacebookMetrics] = useState<MetricsData | null>(null);
  const [instagramMetrics, setInstagramMetrics] = useState<MetricsData_ig | null>(null);
  const [totalSeguidoresGanados, setTotalSeguidoresGanados] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { dateRange } = useDateContext();

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!selectedPage) {
        setError('No se ha seleccionado una página.');
        return;
      } 

      setLoading(true);
      setError(null);

      try {
        const accessToken = Cookies.get('access_token');
        if (!accessToken) {
          setError('No se encontró el token de acceso.');
          setLoading(false);
          return;
        }

        // Obtener métricas de Facebook
        const facebookResponse = await axios.post<MetricsData>(
          'http://localhost:5000/api/facebook/facebook_metricas',
          { page_id: selectedPage.page_id },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setFacebookMetrics(facebookResponse.data);

        // Obtener métricas de Instagram
        const instagramResponse = await axios.post<MetricsData_ig>(
          'http://localhost:5000/api/instagram/instagram_metricas',
          { page_id: selectedPage.page_id },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setInstagramMetrics(instagramResponse.data);

        // Obtener el total de seguidores ganados
        const followersResponse = await axios.post(
          'http://localhost:5000/api/instagram/instagram_follower_by_day',
          {
            page_id: selectedPage.page_id,
            start_date: dateRange.startDate?.toISOString().split('T')[0] || null,
            end_date: dateRange.endDate?.toISOString().split('T')[0] || null,
          },
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setTotalSeguidoresGanados(followersResponse.data.Totales['Total de Seguidores Ganado']);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          const axiosError = err as AxiosError<{ error: string }>;
          setError(axiosError.response?.data.error || 'Error al obtener las métricas.');
        } else {
          setError('Error desconocido.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [selectedPage, dateRange]);

  const convertGraphToBase64 = async (svgElement: SVGSVGElement) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const svgData = new XMLSerializer().serializeToString(svgElement);
  
    const scaleFactor = 4; 
    const width = svgElement.clientWidth || 800;
    const height = svgElement.clientHeight || 350;
  
    canvas.width = width * scaleFactor;
    canvas.height = height * scaleFactor;
  
    if (ctx) {
      ctx.scale(scaleFactor, scaleFactor); // Escala el contexto para alta resolución
      const v = await Canvg.fromString(ctx, svgData);
      await v.render();
      return canvas.toDataURL('image/png', 1.0); // Calidad máxima
    }
  
    return null; // Manejo de error en caso de que no haya contexto
  };

  const convertTableToBase64 = async (tableId: string): Promise<string | null> => {
    const tableElement = document.getElementById(tableId);
    if (!tableElement) {
      console.error("No se encontró la tabla con el ID proporcionado.");
      return null;
    }

    try {
      // Convertir la tabla en una imagen PNG en formato Base64
      const base64Image = await toPng(tableElement);
      return base64Image; // Devuelve la imagen Base64
    } catch (error) {
      console.error("Error al convertir la tabla a Base64:", error);
      return null;
    }
  };

  const descargarReporte = async (tipo: 'pdf' | 'word') => {
    if (!selectedPage) {
      setError('No se ha seleccionado una página.');
      return;
    }

    try {
      
      setError(null);

      const hiddenGraphs = document.getElementById('hidden-graphs');
      if (!hiddenGraphs) {
        setError('Error interno: Contenedor de gráficos no encontrado.');
        return;
      }

      // Esperar brevemente para garantizar que el gráfico esté completamente renderizado
      await new Promise((resolve) => setTimeout(resolve, 500));

      const tableBase64 = await convertTableToBase64("top-posts-table");

      // Renderizar y capturar gráficos como Base64
      const alcanceGraphFbSvg = hiddenGraphs.querySelector('#facebook-graph-alcance svg') as SVGSVGElement;
      const alcanceFacebookBase64 = alcanceGraphFbSvg ? await convertGraphToBase64(alcanceGraphFbSvg) : null;

      const vistasGraphFbSvg = hiddenGraphs.querySelector('#facebook-graph-vistas svg ') as SVGSVGElement;
      const vistasFacebookBase64 = vistasGraphFbSvg ? await convertGraphToBase64(vistasGraphFbSvg) : null;

      const publicacionesGraphFbSvg = hiddenGraphs.querySelector('#facebook-graph-publicaciones svg ') as SVGSVGElement;
      const publicacionesFacebookBase64 = publicacionesGraphFbSvg ? await convertGraphToBase64(publicacionesGraphFbSvg) : null;
      
      const reproduccionesGraphFbSvg = hiddenGraphs.querySelector('#facebook-graph-reproducciones svg ') as SVGSVGElement;
      const reproduccionesFacebookBase64 = reproduccionesGraphFbSvg ? await convertGraphToBase64(reproduccionesGraphFbSvg) : null;

      const reproducciones30sGraphFbSvg = hiddenGraphs.querySelector('#facebook-graph-reproducciones-30s svg ') as SVGSVGElement;
      const reproducciones30sFacebookBase64 = reproducciones30sGraphFbSvg ? await convertGraphToBase64(reproducciones30sGraphFbSvg) : null;

      const alcanceGraphIgSvg = hiddenGraphs.querySelector('#instagram-graph-alcance svg') as SVGSVGElement;
      const alcanceInstagramBase64 = alcanceGraphIgSvg ? await convertGraphToBase64(alcanceGraphIgSvg) : null;

      const publicacionesGraphIgSvg = hiddenGraphs.querySelector('#instagram-graph-publicaciones svg') as SVGSVGElement;
      const publicacionesInstagramBase64 = publicacionesGraphIgSvg ? await convertGraphToBase64(publicacionesGraphIgSvg) : null;

      // Datos para el backend
      const data = {
        page_name: selectedPage.page_name,
        date_range: {
          start_date: dateRange.startDate?.toISOString().split('T')[0] || null,
          end_date: dateRange.endDate?.toISOString().split('T')[0] || null,
        },
        facebook_metrics: facebookMetrics?.Totales || {},
        instagram_metrics: {
          ...instagramMetrics?.Totales,
          'Total de Seguidores Ganado': totalSeguidoresGanados, // Incluyendo el total de seguidores ganados
        },
        alcance_facebook_graph: alcanceFacebookBase64,
        alcance_instagram_graph: alcanceInstagramBase64,
        vistas_facebook_graph: vistasFacebookBase64,
        publicaciones_facebook_graph: publicacionesFacebookBase64,
        publicaciones_instagram_graph: publicacionesInstagramBase64,
        reproducciones_facebook_graph: reproduccionesFacebookBase64,
        reproducciones_30s_facebook_graph: reproducciones30sFacebookBase64,
        table_base64: tableBase64,
      };

      console.log('Datos enviados al backend:', data);

      // Enviar los datos al backend
      const accessToken = Cookies.get('access_token');
      const response = await axios.post(
        'http://localhost:5000/api/report/generate_report_from_data',
        data,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
          responseType: tipo === 'pdf' ? 'blob' : undefined,
        }
      );

      // Si es PDF, descargarlo directamente
    if (tipo === 'pdf') {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // Si es Word, abrir la URL para descargar el archivo
      const wordUrl = 'http://localhost:5000/api/report/download_word_report';
      window.open(wordUrl, '_blank');
    }
  } catch (err) {
    console.error(`Error al descargar el reporte (${tipo}):`, err);
    setError(`Error al generar el reporte (${tipo === 'pdf' ? 'PDF' : 'Word'}).`);
  } finally {
    setLoading(false);
  }
};

const renderMetrics = () => {
  if (loading) { return <ReportSkeleton />;}

  return (
    <>
      {/* Métricas de Facebook */}
      {facebookMetrics && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Resumen de FACEBOOK</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-4 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Me gusta</p>
              <h2 className="text-2xl font-bold">{facebookMetrics.Totales['Total de Me gusta']} Me gusta</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Seguidores</p>
              <h2 className="text-2xl font-bold">{facebookMetrics.Totales['Total de Seguidores']} Seguidores</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Impresiones</p>
              <h2 className="text-2xl font-bold">{facebookMetrics.Totales['Total de Impresiones']} Impresiones</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Visitas a la Página</p>
              <h2 className="text-2xl font-bold">{facebookMetrics.Totales['Total de Visitas a la Página']} Visitas</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Alcance</p>
              <h2 className="text-2xl font-bold">{facebookMetrics.Totales['Total de Alcance']} Alcance</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-blue-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Publicaciones</p>
              <h2 className="text-2xl font-bold">{facebookMetrics.Totales['Total de Publicaciones']} Publicaciones</h2>
            </div>
          </div>
        </div>
      )}

      {/* Métricas de Instagram */}
      {instagramMetrics && (
        <div className="mb-8">
          <h2 className="text-2xl font-semibold mb-4">Resumen de INSTAGRAM</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className={`p-4 ${theme === 'dark' ? 'bg-pink-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Seguidores</p>
              <h2 className="text-2xl font-bold">{instagramMetrics.Totales['Total de Seguidores']} Seguidores</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-pink-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Impresiones</p>
              <h2 className="text-2xl font-bold">{instagramMetrics.Totales['Total de Impresiones']} Impresiones</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-pink-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Alcance</p>
              <h2 className="text-2xl font-bold">{instagramMetrics.Totales['Total de Alcance']} Alcance</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-pink-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Publicaciones</p>
              <h2 className="text-2xl font-bold">{instagramMetrics.Totales['Total de Publicaciones']} Publicaciones</h2>
            </div>

            <div className={`p-4 ${theme === 'dark' ? 'bg-pink-700' : 'bg-blue-100'} shadow rounded-lg text-center transition hover:scale-105`}>
              <p className="text-gray-500">Total de Nuevos Seguidores</p>
              <h2 className="text-2xl font-bold">{totalSeguidoresGanados !== null ? `${totalSeguidoresGanados} Seguidores` : 'N/A'}</h2>
            </div>
          </div>
        </div>
      )}
    </>
  );
};


  return (
    <div className={`p-8 ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-800'} min-h-screen`}>
      {loading ? (
        // Mostrar ReportSkeleton mientras los datos están cargando
        <ReportSkeleton />
      ) : (
        // Mostrar contenido principal cuando los datos están disponibles
        <div className="max-w-6xl mx-auto" id="reporte-content">
          {/* Título y ruta */}
          <div className="mb-6">
            <h1 className="text-3xl font-semibold">Reportes</h1>
            <p className="text-gray-500">Inicio / Reportes</p>
          </div>
  
          {/* Botones de descarga */}
          <div className="mb-5">
            <button
              onClick={() => descargarReporte('pdf')} // Descargar PDF
              className="flex items-center space-x-2 bg-indigo-500 text-white px-6 py-3 rounded-2xl hover:bg-indigo-600 transition hover:scale-105"
            >
              <HiOutlineDocumentReport className="text-2xl" />
              <span className="text-lg font-medium ">Descargar Reporte en PDF</span>
            </button>
          </div>
  
          <div className="mb-5">
            <button
              onClick={() => descargarReporte('word')} // Descargar Word
              className="flex items-center space-x-2 bg-green-500 text-white px-6 py-3 rounded-2xl hover:bg-green-600 transition hover:scale-105"
            >
              <HiOutlineDocumentReport className="text-2xl" />
              <span className="text-lg font-medium">Descargar Reporte en Word</span>
            </button>
          </div>
  
          {/* Mensaje de error, si lo hay */}
          {error && (
            <div className="mb-6 p-4 bg-red-100 text-red-700 rounded">
              {error}
            </div>
          )}
  
          {/* Sección de métricas */}
          {renderMetrics()}
        </div>
      )}
  
      {/* Gráficos ocultos para procesamiento */}
      <div
        id="hidden-graphs"
        style={{
          position: 'absolute',
          top: '-9999px',
          left: '-9999px',
          width: '800px',
          height: '350px',
          overflow: 'hidden',
        }}
      >
        <div id="facebook-graph-alcance">
          <AlcanceGrafico theme={theme} page_id={selectedPage?.page_id} />
        </div>
        <div id="facebook-graph-vistas">
          <VisitasGrafico theme={theme} page_id={selectedPage?.page_id} />
        </div>
        <div id="facebook-graph-publicaciones">
          <PublicacionesGrafico theme={theme} page_id={selectedPage?.page_id} />
        </div>
        <div id="facebook-graph-reproducciones">
          <VideoGrafico theme={theme} page_id={selectedPage?.page_id} />
        </div>
        <div id="facebook-graph-reproducciones-30s">
          <Video30sGrafico theme={theme} page_id={selectedPage?.page_id} />
        </div>
        <div id="instagram-graph-alcance">
          <AlcanceGraficoIg theme={theme} page_id={selectedPage?.page_id} />
        </div>
        <div id="instagram-graph-publicaciones">
          <PublicacionesGraficoIg theme={theme} page_id={selectedPage?.page_id} />
        </div>
        <div id="top-posts-table">
          <CombinedTopReachPostsTable page_id={selectedPage?.page_id || ""} theme={theme} />
        </div>
      </div>
    </div>
  );
  
};

export default Reporte;
