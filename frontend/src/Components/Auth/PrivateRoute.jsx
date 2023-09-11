import React from "react";
import { Navigate } from "react-router-dom";

const PrivateRoute = (props) => {
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

  // Si hay un token, renderiza el componente que corresponde a esta ruta
  if (token) {
    return props.children;
  }

  // Si no hay un token, redirige al usuario a la página de inicio de sesión
  return <Navigate to="/" replace />;
};

export default PrivateRoute;