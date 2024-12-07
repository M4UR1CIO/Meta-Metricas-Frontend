import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

const ReportSkeleton: React.FC = () => {
  return (
    <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center z-40">
      <div className="w-full max-w-7xl p-8 ">
        {/* Título y ruta */}
        <div className="mt-3 mb-3 ">
          <Skeleton width={250} height={80} style={{ borderRadius:"16px" }}/>
        </div>

        {/* Botones de descarga */}
        <div className="mb-3 flex space-x-4">
          <Skeleton width={350} height={70} style={{ borderRadius:"16px" }}/>
        </div>
        <div className="mb-3 flex space-x-4">
          <Skeleton width={350} height={70} style={{ borderRadius:"16px" }}/>
        </div>
        

        {/* Métricas de Facebook */}
        <div className="mb-8">
          <Skeleton width={320} height={50} style={{ borderRadius:"16px" }}/>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {Array.from({ length: 6 }).map((_, idx) => (
              <Skeleton key={idx} width="100%" height={100} style={{ borderRadius:"16px" }}/>
            ))}
          </div>
        </div>
        
        {/* Métricas de Facebook */}
        <div className="mb-8">
          <Skeleton width={320} height={50} style={{ borderRadius:"16px" }}/>
        </div>
      </div>
    </div>
  );
};

export default ReportSkeleton;
