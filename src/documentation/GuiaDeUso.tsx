// src/components/GuiaDeUso.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface GuiaDeUsoProps {
  onClose: () => void;
}

const GuiaDeUso: React.FC<GuiaDeUsoProps> = ({ onClose }) => {
  const [step, setStep] = useState(0);

  // Lista de secciones de la guía de uso
  const steps = [
    {
      title: 'Bienvenido a la Plataforma de Métricas',
      description: 'Aquí puedes explorar y monitorear métricas detalladas de tus cuentas de Facebook e Instagram.',
    },
    {
      title: 'Métricas de Facebook',
      description: 'Accede a gráficos detallados sobre el alcance, interacciones y visitas en tu página de Facebook.',
    },
    {
      title: 'Métricas de Instagram',
      description: 'Obtén información sobre el alcance y desempeño de tus publicaciones en Instagram.',
    },
    {
      title: 'Generación de Reportes',
      description: 'Genera reportes mensuales detallados para analizar el rendimiento de tus redes sociales.',
    },
    {
      title: 'Personalización de Tema',
      description: 'Alterna entre modo claro y oscuro para una experiencia personalizada.',
    },
  ];

  const nextStep = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg shadow-lg p-8 max-w-md w-full"
      >
        <h2 className="text-2xl font-semibold mb-4 text-center">{steps[step].title}</h2>
        <p className="text-center text-lg mb-6">{steps[step].description}</p>

        <div className="flex justify-between items-center mt-6">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className={`px-4 py-2 rounded-lg ${step === 0 ? 'opacity-50 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'} transition duration-300`}
          >
            Anterior
          </button>

          <button
            onClick={nextStep}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition duration-300"
          >
            {step === steps.length - 1 ? 'Finalizar' : 'Siguiente'}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default GuiaDeUso;
