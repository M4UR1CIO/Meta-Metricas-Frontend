import { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { FiEye, FiEyeOff } from 'react-icons/fi';
import anime from 'animejs';
import "@dotlottie/player-component";

const Register: React.FC = () => {
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [tokenUsuario, setTokenUsuario] = useState('');
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [mensajeError, setMensajeError] = useState('');
  const [modalExitoAbierto, setModalExitoAbierto] = useState(false);
  const [, setNombreUsuario] = useState('');
  const navigate = useNavigate();

  const usuarioRef = useRef<HTMLInputElement>(null);
  const contraseñaRef = useRef<HTMLInputElement>(null);
  const tokenUsuarioRef = useRef<HTMLInputElement>(null);

  const togglePasswordVisibility = () => {
    setMostrarContraseña(!mostrarContraseña);
  };

  const animateInputFocus = (element: HTMLInputElement | null) => {
    if (element) {
      anime({
        targets: element,
        borderBottomWidth: '2px',
        borderBottomColor: '#000',
        easing: 'easeOutExpo',
        duration: 500,
      });
    }
  };

  const animateInputBlur = (element: HTMLInputElement | null) => {
    if (element) {
      anime({
        targets: element,
        borderBottomWidth: '1px',
        borderBottomColor: '#ccc',
        easing: 'easeOutExpo',
        duration: 500,
      });
    }
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    animateInputFocus(e.currentTarget);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    animateInputBlur(e.currentTarget);
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const data = {
    username: usuario,
    password: contraseña,
    token_user: tokenUsuario,
  };

  try {
    const response = await axios.post('http://localhost:5000/api/auth/register', data);

    if (response.status === 201) {
      setNombreUsuario(usuario);
      setModalExitoAbierto(true);

      // Redirigir al login después de un breve retraso
      setTimeout(() => {
        navigate("/", { replace: true }); // Redirige al login
      }, 1200);
    } else {
      setMensajeError('Error al crear el usuario.');
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
      setMensajeError('Ocurrió un error, por favor intenta de nuevo.');
    }
  }
};

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-900 p-4">
      <div className="flex flex-col md:flex-row bg-white shadow-2xl rounded-2xl max-w-4xl w-full overflow-hidden">
        <div className="bg-gray-200 w-full md:w-1/2 flex items-center justify-center p-6">
          {/* Componente de Lottie para animación */}
          <dotlottie-player
            src="https://lottie.host/4ac4a610-2a43-49e0-b946-b49d0a53cfe0/YexpZfbO28.json"
            background="transparent"
            speed={1}
            style={{ width: "300px", height: "300px" }}
            loop
            autoplay
          ></dotlottie-player>
        </div>
        <div className="p-10 w-full md:w-1/2 flex flex-col items-center">
          <h1 className="text-3xl font-bold mb-2 text-gray-900 text-center">Crear Cuenta</h1>
          <p className="text-sm text-gray-500 mb-8 text-center">Por favor complete los datos</p>
          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            <div className="relative">
              <label className="block text-left mb-1 text-sm font-medium text-gray-600">Usuario</label>
              <input
                ref={usuarioRef}
                type="text"
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition-all"
                placeholder="Nombre de Usuario"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <div className="relative">
              <label className="block text-left mb-1 text-sm font-medium text-gray-600">Contraseña</label>
              <input
                ref={contraseñaRef}
                type={mostrarContraseña ? "text" : "password"}
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition-all"
                placeholder="********"
                value={contraseña}
                onChange={(e) => setContraseña(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-3 top-9 transform -translate-y-1/2 text-gray-500 hover:text-gray-800"
              >
                {mostrarContraseña ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>
            <div className="relative">
              <label className="block text-left mb-1 text-sm font-medium text-gray-600">Token de Usuario</label>
              <input
                ref={tokenUsuarioRef}
                type="text"
                className="w-full px-4 py-2 border-b-2 border-gray-300 focus:outline-none focus:border-gray-800 transition-all"
                placeholder="Token de Usuario"
                value={tokenUsuario}
                onChange={(e) => setTokenUsuario(e.target.value)}
                onFocus={handleFocus}
                onBlur={handleBlur}
              />
            </div>
            <button type="submit" className="w-full py-3 bg-black text-white rounded-lg hover:bg-gray-800 transition-all">
              Crear Usuario
            </button>
            {mensajeError && <p className="text-red-500 text-sm mt-2 text-center">{mensajeError}</p>}
          </form>
        </div>
      </div>

      {modalExitoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="modal modal-open">
            <div className="modal-box text-center">
              <div className="flex flex-col justify-center items-center">
                <h3 className="font-bold text-2xl text-green-600">Usuario creado con éxito!</h3>
                <p className="text-sm text-gray-600 mt-2">Redirigiendo al inicio de sesión...</p>
                <div className="flex justify-center items-center mt-4">
                  <span className="loading loading-spinner loading-lg text-green-600"></span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Register;
