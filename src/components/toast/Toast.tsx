  // src/components/Toast.tsx
  import React from "react";
  import { ToastContainer } from "react-toastify";
  import "react-toastify/dist/ReactToastify.css";

  const ToastError: React.FC = () => {
    return (
      <ToastContainer
        position="bottom-center"
        autoClose={5000}
        hideProgressBar={true}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    );
  };

  export default ToastError;
