// src/utils/toastUtils.ts
import { toast, ToastOptions, ToastPosition } from 'react-toastify';

const toastOptions: ToastOptions = {
  position: "bottom-center" as ToastPosition, // Usa un valor válido para ToastPosition
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "dark",
};

export const showToastError = (message: string) => {
  toast.error(message, toastOptions);
};
