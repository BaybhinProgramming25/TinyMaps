import { useAuth } from "../contexts/AuthContext"
import { Navigate } from "react-router-dom";

const PublicRoute = ({ children }) => {

    const { user } = useAuth();

    if (user) {
        return <Navigate to='/dashboard' />
    }

    return children;

}

export default PublicRoute;