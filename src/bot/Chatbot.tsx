import React, { useState, useEffect, useRef } from 'react';
import { Transition } from '@headlessui/react';
import { useChat } from '../context/ChatContext';
import anime from 'animejs';
import { motion } from 'framer-motion';

interface ChatbotProps {
  onNavigateCommand: (platform: string) => void;
}

const Chatbot: React.FC<ChatbotProps> = ({ onNavigateCommand }) => {
  const { messages, addMessage } = useChat();
  const [userInput, setUserInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const botRef = useRef<HTMLDivElement>(null);

  const skeletonMessages = [
    "Pensando...",
    "Procesando solicitud...",
    "Dame un momento...",
    "Obteniendo información...",
  ];

  const getRandomSkeletonMessage = () => {
    return skeletonMessages[Math.floor(Math.random() * skeletonMessages.length)];
  };

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isChatOpen]);

  // Animación de entrada al cargar la página desde el lado derecho
  useEffect(() => {
    anime({
      targets: botRef.current,
      translateX: [800, 0], // Desde fuera del lado derecho de la pantalla
      translateY: [200, 0], // Un poco más alto para que parezca que cae
      rotate: [45, 0], // Giro inicial para efecto de rotación en el aire
      scale: [0.8, 1], // Escala para dar un efecto de "zoom" mientras se acerca
      duration: 1500,
      easing: 'easeInOutQuart',
      opacity: [0, 1],
    });
  }, []);

  const handleSendMessage = async () => {
    if (userInput.trim()) {
      addMessage({ text: userInput, sender: "user" });
      setUserInput("");
      setLoading(true);
  
      try {
        const response = await fetch("http://127.0.0.1:5000/api/chatbot/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userInput }),
        });
  
        const data = await response.json();
        if (data.response) {
          addMessage({ text: data.response, sender: "bot" });
  
          if (data.navigateTo) {
            document.cookie = `selected_platform=${data.navigateTo}; path=/`;
            onNavigateCommand(data.navigateTo); 
  
            // Añadir un mensaje adicional para la sección
            const sectionMessages: Record<string, string> = {
              facebook: "Ya estás en la sección de Facebook. Aquí puedes ver métricas de alcance, publicaciones y más.",
              instagram: "Ya estás en la sección de Instagram. Aquí puedes explorar impresiones, alcance y datos demográficos.",
              reportes: "Ya estás en la sección de Reportes. Aquí puedes generar reportes detallados de tus métricas.",
            };
            const additionalMessage = sectionMessages[data.navigateTo];
            if (additionalMessage) {
              addMessage({ text: additionalMessage, sender: "bot" });
            }
          }
        } else {
          addMessage({
            text: "Error al obtener la respuesta del bot",
            sender: "bot",
          });
        }
      } catch {
        console.error("Error al interactuar con el bot");
      } finally {
        setLoading(false);
      }
    }
  };
  

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleSendMessage();
    }
  };

  const toggleChat = () => {
    setIsChatOpen(!isChatOpen);
  };
  const messageVariants = {
    hidden: (custom: { sender: string }) => ({
      opacity: 0,
      x: custom.sender === 'bot' ? -100 : 100, // Slide desde izquierda o derecha
      scale: 0.9,
    }),
    visible: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: { type: 'spring', duration: 0.5 },
    },
  };
  

  return (
    <div className="fixed bottom-4 right-4 z-50" ref={botRef}>
      {!isChatOpen && (
        <div onClick={toggleChat} className="cursor-pointer">
          <dotlottie-player
            src="https://lottie.host/6fc6e379-bedd-4f36-980f-5876f4f40ffd/RMlXseo8g9.json"
            background="transparent"
            speed={1}
            style={{ width: '165px', height: '165px' }}
            loop
            autoplay
          ></dotlottie-player>
        </div>
      )}

      <Transition
        show={isChatOpen}
        enter="transition ease-out duration-300"
        enterFrom="transform scale-95 opacity-0"
        enterTo="transform scale-100 opacity-100"
        leave="transition ease-in duration-200"
        leaveFrom="transform scale-100 opacity-100"
        leaveTo="transform scale-95 opacity-0"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', duration: 0.8 }}
          className="w-[400px] h-[600px] bg-white rounded-lg shadow-lg overflow-hidden chatbot-container"
        >
          <div className="flex items-center justify-between p-4 bg-blue-600 text-white cursor-pointer">
            <div className="flex items-center">
              <dotlottie-player
                src="https://lottie.host/6fc6e379-bedd-4f36-980f-5876f4f40ffd/RMlXseo8g9.json"
                background="transparent"
                speed={1}
                style={{ width: '50px', height: '50px' }}
                loop
                autoplay
              ></dotlottie-player>
              <div className="ml-3">
                <h2 className="text-lg font-semibold">Botcito</h2>
                <p className="text-green-300 text-xs">● Online</p>
              </div>
            </div>
            <button onClick={toggleChat} className="text-white text-lg">
              ✕
            </button>
          </div>

          <div ref={chatContainerRef} className="flex-1 p-4 h-[400px] overflow-y-auto bg-gray-100">
  {messages.map((message, index) => (
    <motion.div
      key={index}
      className={`message flex items-start mb-4 ${
        message.sender === 'bot' ? 'justify-start' : 'justify-end'
      }`}
      custom={{ sender: message.sender }}
      initial="hidden"
      animate="visible"
      variants={messageVariants}
    >
      <div
        className={`p-3 max-w-xs rounded-lg text-sm ${
          message.sender === 'bot' ? 'bg-white text-gray-900 shadow-md' : 'bg-blue-500 text-white shadow-md'
        }`}
      >
        {message.text}
      </div>
    </motion.div>
  ))}

  {loading && (
    <motion.div
      className="message flex justify-start mb-4 text-gray-400"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
    >
      {getRandomSkeletonMessage()}
    </motion.div>
  )}
</div>

          <div className="flex items-center p-4 bg-white border-t border-gray-200">
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={handleKeyPress}
              className="flex-1 p-3 text-sm border-none focus:outline-none bg-gray-100 rounded-lg"
              placeholder="Escribe un mensaje..."
              disabled={loading}
            />
            <button onClick={handleSendMessage} className="ml-3 p-3 bg-blue-600 text-white rounded-full shadow-lg" disabled={loading}>
              {loading ? 'Cargando...' : 'Enviar'}
            </button>
          </div>
        </motion.div>
      </Transition>
    </div>
  );
};

export default Chatbot;
