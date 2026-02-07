import { Routes, Route, useNavigate } from "react-router-dom";
import { authRoutes, publicRoutes } from "./router.link";
import Feature from "./feature";
import AuthFeature from "./authFeature";
import Login from "../auth/login/login";
import { ToastContainer, Zoom } from 'react-toastify';
import ChatBot from "../admin/management/chatboat";
import { useEffect } from "react";
import { setupAxiosInterceptor } from "../service/api";
import ProtectedRoutes from "./ProtectedRoutes";
import { useSelector } from "react-redux";
import type { RootState } from "../core/data/redux/store";

const ALLRoutes: React.FC = () => {
  const navigate = useNavigate();
  const { isAuth } = useSelector((state: RootState) => state.authSlice)

  useEffect(() => {
    setupAxiosInterceptor(navigate);
  }, [navigate]);

  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route element={<ProtectedRoutes />}>
          <Route element={<Feature />}>
            {publicRoutes.map((route, idx) => (
              <Route key={idx} path={route.path} element={route.element} />
            ))}
          </Route>
        </Route>
        <Route element={<AuthFeature />}>
          {authRoutes.map((route, idx) => (
            <Route key={idx} path={route.path} element={route.element} />
          ))}
        </Route>
      </Routes>
      {isAuth && <ChatBot />}

      <ToastContainer
        autoClose={3000}
        transition={Zoom}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
};

export default ALLRoutes;
