import { useNavigate } from "react-router-dom";
import {
  getAccessToken,
  removeAccessToken,
  saveAccessToken,
  saveUserInfo,
  getUserInfo
} from "../utils/TokenUtilities";
import { useEffect, useState } from "react";
import { login, getProfile } from "../services/AuthService";

const useAuthentication = () => {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(getUserInfo());
  const [isLoading, setIsLoading] = useState(true);

  const validateLogin = () => {
    const token = getAccessToken();
    if (!token) {
      return false;
    }
    return true;
  };

  const fetchUserInfo = async () => {
    try {
      const userData = await getProfile();
      // userData viene del JWT: { userId, username, rol }
      const userObj = {
        id: userData.userId,
        username: userData.username,
        rol: userData.rol
      };
      saveUserInfo(userObj);
      setUserInfo(userObj);
      return userObj;
    } catch (error) {
      console.error("Error fetching user info:", error);
      removeAccessToken();
      return null;
    }
  };

  const doLogin = async (loginData) => {
    try {
      const response = await login(loginData);
      // Backend retorna: { access_token, usuario: { id, username, rol, persona } }
      saveAccessToken(response.access_token);

      // Guardar info del usuario directamente de la respuesta
      const userObj = {
        id: response.usuario.id,
        username: response.usuario.username,
        rol: response.usuario.rol,
        persona: response.usuario.persona
      };
      saveUserInfo(userObj);
      setUserInfo(userObj);

      // Redirigir según el rol
      switch (userObj.rol) {
        case 'ADMINISTRADOR':
          navigate("/admin");
          break;
        case 'MESERO':
          navigate("/mesero/mesas");
          break;
        default:
          navigate("/login");
          break;
      }
      return true;
    } catch (error) {
      console.error("Error al iniciar sesión:", error);
      return false;
    }
  };

  const doLogout = () => {
    removeAccessToken();
    setUserInfo(null);
    navigate("/login");
  };

  useEffect(() => {
    const initAuth = async () => {
      if (validateLogin() && !userInfo) {
        await fetchUserInfo();
      }
      setIsLoading(false);
    };
    initAuth();
    // eslint-disable-next-line
  }, []);

  return {
    doLogin,
    doLogout,
    validateLogin,
    fetchUserInfo,
    userInfo,
    isLoading
  };
};

export default useAuthentication;
