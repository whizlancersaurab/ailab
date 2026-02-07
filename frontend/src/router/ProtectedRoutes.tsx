import { useEffect} from "react";
import { Navigate, Outlet } from "react-router-dom";
import { Spinner } from "../spinner";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../core/data/redux/store";
import { fetchAuthStatus } from "../core/data/redux/authSlice";

const ProtectedRoutes: React.FC = () => {

    const dispatch = useDispatch<AppDispatch>()
    const { isAuth, loading } = useSelector((state: RootState) => state.authSlice)

    useEffect(() => {
        if (isAuth === null) {
            dispatch(fetchAuthStatus())
        }
    }, [dispatch, isAuth])

    if (loading || isAuth === null) return <Spinner />
    if (!isAuth) return <Navigate to={'/'} replace />

    return <Outlet />

};

export default ProtectedRoutes;
