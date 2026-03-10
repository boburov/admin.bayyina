import { Navigate, Outlet } from "react-router-dom";

const GuestGuard = () => {
  const token = localStorage.getItem("authToken");

  if (token) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default GuestGuard;
