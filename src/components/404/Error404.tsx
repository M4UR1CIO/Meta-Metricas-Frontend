// src/404/Error404.tsx
import React, { useEffect, useState } from 'react';
import Lottie from 'lottie-react';
import axios from 'axios';

const Error404: React.FC = () => {
  const [animationData, setAnimationData] = useState<unknown>(null);

  useEffect(() => {
    axios
      .get('https://lottie.host/0bbd66b7-2833-44fe-aa36-2e9a4abc8134/TBlQBZDL9W.json')
      .then((response) => setAnimationData(response.data))
      .catch((error) => console.error("Error loading animation:", error));
  }, []);

  if (!animationData) return null; 

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Lottie 
        animationData={animationData}
        loop
        autoplay
        style={{ width: 350, height: 350 }}
      />
      <h2 className="text-2xl font-bold mt-4">404 - Página No Encontrada</h2>
      <p className="text-lg text-gray-600">Lo sentimos, la página que estás buscando no existe.</p>
    </div>
  );
};

export default Error404;
