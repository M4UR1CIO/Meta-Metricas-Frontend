import React, { useState } from 'react';
import axios from 'axios';

interface ActualizarCuentaProps {
  username: string;
  onClose: () => void;
}

const ActualizarCuenta: React.FC<ActualizarCuentaProps> = ({ username, onClose }) => {
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newTokenUser, setNewTokenUser] = useState('');
  const [mensaje, setMensaje] = useState('');

  const handleUpdate = async () => {
    try {
      const data = {
        username: newUsername || username,
        password: newPassword || undefined,
        token_user: newTokenUser || undefined,
      };

      const response = await axios.put('http://localhost:5000/api/auth/update_user', data, {
        withCredentials: true,
      });

      setMensaje(response.data.msg);
      setTimeout(onClose, 2000);
    } catch (error) {
      setMensaje('Error al actualizar la cuenta.');
      console.error(error);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-8 rounded shadow-lg max-w-md w-full">
        <h2 className="text-lg font-bold mb-4">Actualizar Cuenta</h2>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nuevo Usuario</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nueva Contraseña</label>
          <input
            type="password"
            className="w-full px-4 py-2 border rounded"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Nuevo Token de Usuario</label>
          <input
            type="text"
            className="w-full px-4 py-2 border rounded"
            value={newTokenUser}
            onChange={(e) => setNewTokenUser(e.target.value)}
          />
        </div>
        <button
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
          onClick={handleUpdate}
        >
          Actualizar
        </button>
        {mensaje && <p className="mt-4 text-center text-sm">{mensaje}</p>}
        <button
          className="mt-4 w-full text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default ActualizarCuenta;
