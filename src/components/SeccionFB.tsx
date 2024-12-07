import React, { useState } from "react";
import { motion } from "framer-motion";
import MetricsButtons from "./buttons/MetricsButtons";
import LikePaginaGrafico from "./grafico/Facebook/LikePaginaGrafico";
import AlcanceGrafico from "./grafico/Facebook/AlcanceGrafico";
import VisitasGrafico from "./grafico/Facebook/VisitasGrafico";
import PublicacionesGrafico from "./grafico/Facebook/PublicacionesGrafico";
import VideoGrafico from "./grafico/Facebook/VideoGrafico";
import Video30sGrafico from "./grafico/Facebook/Video30sGrafico";
import CountryGraph from "./grafico/Facebook/PaisGrafico";
import { FaThumbsUp, FaEye, FaGlobe } from "react-icons/fa";
import { MdBarChart } from "react-icons/md";
import { IoMdPlay } from "react-icons/io";
import { AiOutlineFileText } from "react-icons/ai";
import FacebookSkeleton from "./Skeletons/Skeleton";

interface SeccionFBProps {
  theme: string;
  selectedPage: { page_id: string; page_name: string };
}

const SeccionFB: React.FC<SeccionFBProps> = ({ theme, selectedPage }) => {
  const [selectedGraph, setSelectedGraph] = useState<string>("Me gusta (Pagina)");
  const [loading, setLoading] = useState<boolean>(true);

  const handleMetricsLoad = () => {
    setLoading(false);
  };

      return (
        <div className="relative">
        {loading && <FacebookSkeleton width="100%" height="570px" />}
          
          <div
          className={`transition-opacity ${
            loading ? "opacity-50 pointer-events-none" : "opacity-100 pointer-events-auto"
            }`}
          >
          <div className="relative mb-3 w-full">
            <MetricsButtons selectedPageId={selectedPage.page_id} onLoad={handleMetricsLoad} />
          </div>

        <div className="border border-gray-300 rounded-3xl p-1 mb-2 max-w-none mx-auto w-full sm:w-auto">
          <div
            className="flex justify-between items-center overflow-x-auto overflow-y-hidden scrollbar-hide space-x-4 p-1.5"
            style={{
              scrollSnapType: "x mandatory",
              whiteSpace: "nowrap",
              scrollPaddingRight: "16px",
            }}
          >
            <button
              onClick={() => setSelectedGraph("Me gusta (Pagina)")}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-50 ${
                selectedGraph === "Me gusta (Pagina)"
                  ? "bg-blue-200 text-gray-800"
                  : "bg-blue-50 text-gray-800 border border-gray-300"
              } rounded-2xl transition-transform transform hover:scale-105`}
            >
              <FaThumbsUp />
              Me gusta (Pagina)
            </button>

            <button
              onClick={() => setSelectedGraph("Alcance")}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-36 ${
                selectedGraph === "Alcance"
                  ? "bg-blue-200 text-gray-800"
                  : "bg-blue-50 text-gray-800 border border-gray-300"
              } rounded-2xl transition-transform transform hover:scale-105`}
            >
              <MdBarChart />
              Alcance
            </button>

            <button
              onClick={() => setSelectedGraph("Visitas")}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-36 ${
                selectedGraph === "Visitas"
                  ? "bg-blue-200 text-gray-800"
                  : "bg-blue-50 text-gray-800 border border-gray-300"
              } rounded-2xl transition-transform transform hover:scale-105`}
            >
              <FaEye />
              Visitas
            </button>

            <button
              onClick={() => setSelectedGraph("Publicaciones")}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-40 ${
                selectedGraph === "Publicaciones"
                  ? "bg-blue-200 text-gray-800"
                  : "bg-blue-50 text-gray-800 border border-gray-300"
              } rounded-2xl transition-transform transform hover:scale-105`}
            >
              <AiOutlineFileText />
              Publicaciones
            </button>

            <button
              onClick={() => setSelectedGraph("Reproducciones")}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-44 ${
                selectedGraph === "Reproducciones"
                  ? "bg-blue-200 text-gray-800"
                  : "bg-blue-50 text-gray-800 border border-gray-300"
              } rounded-2xl transition-transform transform hover:scale-105`}
            >
              <IoMdPlay />
              Reproducciones
            </button>

            <button
              onClick={() => setSelectedGraph("Reproducciones 30s")}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-48 ${
                selectedGraph === "Reproducciones 30s"
                  ? "bg-blue-200 text-gray-800"
                  : "bg-blue-50 text-gray-800 border border-gray-300"
              } rounded-2xl transition-transform transform hover:scale-105`}
            >
              <IoMdPlay />
              Reproducciones 30s
            </button>

            <button
              onClick={() => setSelectedGraph("Demografia")}
              className={`flex items-center justify-center gap-2 px-4 py-2 w-40 ${
                selectedGraph === "Demografia"
                  ? "bg-blue-200 text-gray-800"
                  : "bg-blue-50 text-gray-800 border border-gray-300"
              } rounded-2xl transition-transform transform hover:scale-105`}
            >
              <FaGlobe />
              Demografia
            </button>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 gap-4 items-center w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="col-span-1 md:col-span-2 lg:col-span-3 shadow-lg rounded-lg p-4 w-full"
          >
            <>
              {selectedGraph === "Me gusta (Pagina)" && (
                <LikePaginaGrafico theme={theme} page_id={selectedPage.page_id} />
              )}
              {selectedGraph === "Alcance" && (
                <AlcanceGrafico theme={theme} page_id={selectedPage.page_id} />
              )}
              {selectedGraph === "Visitas" && (
                <VisitasGrafico theme={theme} page_id={selectedPage.page_id} />
              )}
              {selectedGraph === "Publicaciones" && (
                <PublicacionesGrafico theme={theme} page_id={selectedPage.page_id} />
              )}
              {selectedGraph === "Reproducciones" && (
                <VideoGrafico theme={theme} page_id={selectedPage.page_id} />
              )}
              {selectedGraph === "Demografia" && (
                <CountryGraph page_id={selectedPage.page_id} />
              )}
              {selectedGraph === "Reproducciones 30s" && (
                <Video30sGrafico theme={theme} page_id={selectedPage.page_id} />
              )}
            </>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default SeccionFB;
