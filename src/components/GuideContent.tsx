import React from 'react';

const GuideContent: React.FC = () => {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Guía de Uso</h1>
      <p>Esta plataforma te permite realizar el seguimiento de métricas en redes sociales, como Facebook e Instagram.</p>

      <section>
        <h2 className="text-xl font-semibold">Navegación en la Plataforma</h2>
        <p>Usa el menú lateral para seleccionar la plataforma que deseas analizar. Cada opción te llevará a una vista donde puedes ver las métricas disponibles.</p>
      </section>

      <section>
        <h2 className="text-xl font-semibold">Generación de Reportes</h2>
        <p>En la sección de reportes, podrás obtener informes detallados de tus métricas y descargarlos para análisis.</p>
      </section>
    </div>
  );
};

export default GuideContent;
