import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

interface SectionSkeletonProps {
  width?: string | number; 
  height?: string | number; 
}

const SectionSkeleton: React.FC<SectionSkeletonProps> = ({
  width = "100%",
  height = "570px",
}) => {
  return (
    <div
      className="absolute inset-0 bg-gray-200 bg-opacity-75 flex flex-col items-center justify-center z-10 space-y-4"
      style={{ width, height }}
    >
      <Skeleton height={40} width="80%" style={{ borderRadius: "12px" }} />

      {/* Contenedor principal con múltiples bloques */}
      <div className="w-full max-w-8xl p-3 bg-blue-50 rounded-lg shadow-md">
        <div className="grid grid-cols-3 gap-7 mb-3">
          <Skeleton height={80} width="100%" style={{ borderRadius: "24px" }} />
          <Skeleton height={80} width="100%" style={{ borderRadius: "24px" }} />
          <Skeleton height={80} width="100%" style={{ borderRadius: "24px" }} />
        </div>

        <Skeleton height={65} width="100%" style={{ borderRadius: "24px" }} />

        <div className="grid gap-6 mt-3">
          <Skeleton height={440} width="100%" style={{ borderRadius: "24px" }} />
        </div>
      </div>
    </div>
  );
};

export default SectionSkeleton;
