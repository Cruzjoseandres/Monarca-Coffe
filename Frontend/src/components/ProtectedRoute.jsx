import { Navigate } from "react-router-dom";
import { getAccessToken, getUserInfo } from "../../utils/TokenUtilities";

const ProtectedRoute = ({ children, allowedRoles }) => {
    const token = getAccessToken();
    const userInfo = getUserInfo();

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && userInfo && !allowedRoles.includes(userInfo.rol)) {
        // Redirigir al dashboard correcto según el rol del usuario
        switch (userInfo.rol) {
            case 'ADMINISTRADOR':
                return <Navigate to="/admin/usuarios" replace />;
            case 'MESERO':
                return <Navigate to="/mesero/mesas" replace />;
            default:
                return <Navigate to="/login" replace />;
        }
    }

    return children;
};

export default ProtectedRoute;
