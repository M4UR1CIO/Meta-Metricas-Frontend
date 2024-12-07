import React, { useState } from "react";
import { motion } from "framer-motion";
import MetricsButtons_ig from "./buttons/MetricsButtonsIg";
import AlcanceGraficoIg from "./grafico/Instagram/AlcanceGraficoIg";
import PublicacionesGraficoIg from "./grafico/Instagram/PublicacionesGraficoIg";
import ImpresionesGraficoIg from "./grafico/Instagram/ImpresionesGraficoIg";
import CombinedTopReachPostsTable from "./grafico/Instagram/TopGraficReach";
import GenderGraphIg from "./grafico/Instagram/GeneroGrafico";
import EdadGraficoIg from "./grafico/Instagram/EdadGraficoIg";
import CityGraphIg from "./grafico/Instagram/CiudadGraficoIg";
import CountryGraphIg from "./grafico/Instagram/PaisGraficoIg";
import { MdBarChart } from "react-icons/md";
import { AiOutlineFileText } from "react-icons/ai";
import { IoMdEye } from "react-icons/io";
import { FaUserFriends, FaGlobe } from "react-icons/fa";
import SectionSkeleton from "./Skeletons/Skeleton";

interface SeccionIGProps {
  theme: string;
  selectedPage: { page_id: string; page_name: string };
}

const SeccionIG: React.FC<SeccionIGProps> = ({ theme, selectedPage }) => {
  const [selectedGraph, setSelectedGraph] = useState<string>("Alcance");
  const [loading, setLoading] = useState<boolean>(true);

  const handleMetricsLoad = () => {
    setLoading(false);
  };

  return (
    <div className="relative">
        {loading && <SectionSkeleton width="100%" height="570px" />}
          
          <div
          className={`transition-opacity ${
            loading ? "opacity-50 pointer-events-none" : "opacity-100 pointer-events-auto"
            }`}
          >
      <div className="mb-3 w-full">
        <MetricsButtons_ig selectedPageId={selectedPage.page_id} onLoad={handleMetricsLoad}/>
      </div>

      <div
        className="border border-gray-300 rounded-3xl p-1 mb-2 max-w-none mx-auto w-full sm:w-11/12"
      >
        <div
          className="flex justify-between items-center overflow-x-auto overflow-y-hidden scrollbar-hide space-x-4 p-1.5"
          style={{
            scrollSnapType: "x mandatory",
            whiteSpace: "nowrap",
          }}
        >
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
            onClick={() => setSelectedGraph("Top 5 Publicaciones")}
            className={`flex items-center justify-center gap-2 px-4 py-2 w-48 ${
              selectedGraph === "Top 5 Publicaciones"
                ? "bg-blue-200 text-gray-800"
                : "bg-blue-50 text-gray-800 border border-gray-300"
            } rounded-2xl transition-transform transform hover:scale-105`}
          >
            <AiOutlineFileText />
            Top 5 Publicaciones
          </button>

          <button
            onClick={() => setSelectedGraph("Impresiones")}
            className={`flex items-center justify-center gap-2 px-4 py-2 w-36 ${
              selectedGraph === "Impresiones"
                ? "bg-blue-200 text-gray-800"
                : "bg-blue-50 text-gray-800 border border-gray-300"
            } rounded-2xl transition-transform transform hover:scale-105`}
          >
            <IoMdEye />
            Impresiones
          </button>

          <button
            onClick={() => setSelectedGraph("Datos Demograficos")}
            className={`flex items-center justify-center gap-2 px-4 py-2 w-50 ${
              selectedGraph === "Datos Demograficos"
                ? "bg-blue-200 text-gray-800"
                : "bg-blue-50 text-gray-800 border border-gray-300"
            } rounded-2xl transition-transform transform hover:scale-105`}
          >
            <FaUserFriends />
            Datos Demograficos
          </button>

          <button
            onClick={() => setSelectedGraph("Localizacion Demografica")}
            className={`flex items-center justify-center gap-2 px-4 py-2 w-50 ${
              selectedGraph === "Localizacion Demografica"
                ? "bg-blue-200 text-gray-800"
                : "bg-blue-50 text-gray-800 border border-gray-300"
            } rounded-2xl transition-transform transform hover:scale-105`}
          >
            <FaGlobe />
            Localizacion Demografica
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 items-center w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="col-span-1 md:col-span-2 lg:col-span-3 shadow-lg rounded-lg p-4 w-full"
        >
          {selectedGraph === "Alcance" && (<AlcanceGraficoIg theme={theme} page_id={selectedPage.page_id} />)}
          {selectedGraph === "Publicaciones" && (<PublicacionesGraficoIg theme={theme} page_id={selectedPage.page_id} />)}
          {selectedGraph === "Top 5 Publicaciones" && (<CombinedTopReachPostsTable theme={theme} page_id={selectedPage.page_id}/>)}
          {selectedGraph === "Impresiones" && (<ImpresionesGraficoIg theme={theme} page_id={selectedPage.page_id} />)}
          {selectedGraph === "Datos Demograficos" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "300px" }}>
                <GenderGraphIg page_id={selectedPage.page_id} />
              </div>
              <div style={{ flex: 1, minWidth: "300px" }}>
                <EdadGraficoIg page_id={selectedPage.page_id} />
              </div>
            </div>
          )}
          {selectedGraph === "Localizacion Demografica" && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "20px",
                flexWrap: "wrap",
              }}
            >
              <div style={{ flex: 1, minWidth: "300px" }}>
                <CityGraphIg page_id={selectedPage.page_id} />
              </div>
              <div style={{ flex: 1, minWidth: "300px" }}>
                <CountryGraphIg page_id={selectedPage.page_id} />
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
    </div>
  );
};

export default SeccionIG;