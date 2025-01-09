import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {RootState} from "../../../redux/store.ts";


export const ProtectedRoute = () => {
    const { isAuthenticated } = useSelector((state: RootState) => state.authorization);

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};
