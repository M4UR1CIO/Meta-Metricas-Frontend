import { FC } from "react";

export interface FacebookSkeletonProps {
  width?: string; 
  height?: string; 
  className?: string; 
}

const FacebookSkeleton: FC<FacebookSkeletonProps> = ({
  width = "300px",
  height = "300px",
  className = "",
}) => {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width, height }}
    >
      <dotlottie-player
        src="https://lottie.host/e16722ee-6444-4758-96fc-e34f53819bd8/kKqFc2WRNl.json"
        background="transparent"
        speed={1}
        style={{ width, height }}
        loop
        autoplay
      ></dotlottie-player>
    </div>
  );
};

export default FacebookSkeleton;
