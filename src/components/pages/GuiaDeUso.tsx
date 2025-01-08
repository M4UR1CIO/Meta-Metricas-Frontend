import React from 'react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

// Definir tipos de los props
interface DocumentationPageProps {
  onGuideComplete?: () => void; // Prop opcional
}

const DocumentationPage: React.FC<DocumentationPageProps> = ({ onGuideComplete }) => {
  const navigate = useNavigate();

  const handleFinishGuide = () => {
    // Establecer la cookie `guide_seen`
    Cookies.set('guide_seen', 'true', { secure: true, sameSite: 'Strict', expires: 30 });
    
    // Llamar a `onGuideComplete` si está definido
    if (onGuideComplete) {
      onGuideComplete();
    } else {
      // Redirigir al dashboard si `onGuideComplete` no está definido
      navigate('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-white to-gray-100 text-gray-700">
      {/* Header Section */}
      <section className="text-center py-16 px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-purple-600 text-4xl font-extrabold">📊</div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mt-4">
            Guía de Uso de la Plataforma
          </h1>
          <p className="text-lg mt-4 text-gray-600">
            Bienvenido a la plataforma de métricas de redes sociales. Aprende a navegar y aprovechar al máximo sus herramientas.
          </p>
          <button
            onClick={handleFinishGuide}
            className="mt-8 px-6 py-3 bg-purple-600 text-white rounded-lg shadow-lg hover:bg-purple-700 transition"
          >
            Dame click si entendiste la Guía de Uso
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">
            Características principales
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12">
            <Feature
              icon="📋"
              title="Navegación en la Plataforma"
              description="Usa el menú lateral para moverte entre las secciones disponibles: Facebook, Instagram y Reportes."
            />
            <Feature
              icon="📄"
              title="Generación de Reportes"
              description="Genera informes personalizados en formatos PDF o Word con métricas clave como alcance, impresiones y rendimiento."
            />
            <Feature
              icon="🤖"
              title="Chatbot"
              description="Interactúa con nuestro asistente virtual para resolver dudas y recibir soporte en tiempo real."
            />
            <Feature
              icon="📅"
              title="Filtro por Fecha"
              description="Selecciona un rango de fechas específico para visualizar métricas detalladas de tus cuentas."
            />
            <Feature
              icon="📈"
              title="Visualización de Datos"
              description="Explora gráficos dinámicos para analizar el rendimiento de tus redes sociales."
            />
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900">Consejos de Uso</h2>
          <p className="text-gray-600 mt-4">
            Aprovecha al máximo la plataforma con estos consejos:
          </p>
          <ul className="list-disc text-left pl-6 mt-8 space-y-4 text-gray-600">
            <li>Conecta todas las cuentas relevantes desde el backend para obtener datos precisos.</li>
            <li>Descarga reportes periódicos para tomar decisiones estratégicas basadas en métricas.</li>
            <li>Usa el chatbot para resolver dudas rápidamente y navegar eficientemente.</li>
          </ul>
        </div>
      </section>

      {/* Footer Section */}
      <footer className="py-8 bg-white border-t">
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-gray-500">
            Esta plataforma fue desarrollada por <strong>Oscar Alhdhair Vásquez Roncal</strong> y <strong>Mauricio Jesús Palomino Ayala</strong>, como parte de su tesis de grado, con el apoyo de <strong>TGH Technology Solution</strong>. ¡Gracias por utilizar nuestra herramienta!
          </p>
        </div>
      </footer>
    </div>
  );
};

const Feature: React.FC<{ icon: string; title: string; description: string }> = ({ icon, title, description }) => {
  return (
    <div className="flex items-start space-x-4">
      <div className="text-purple-600 text-3xl">{icon}</div>
      <div>
        <h3 className="text-xl font-semibold text-gray-800">{title}</h3>
        <p className="text-gray-600 mt-2">{description}</p>
      </div>
    </div>
  );
};

export default DocumentationPage;