import { useAuthStore } from "@/stores/useAuthStore";
import { useEffect, useState } from "react";
import {Navigate, Outlet} from 'react-router-dom';


const ProtectedRoute = () => {

    const {accessToken, user, loading, refresh, fetchMe} = useAuthStore();

    const [Starting, setStarting] = useState(true);

    const init = async () => {

        if(!accessToken)
        {
            await refresh();    
        }
        if(accessToken && !user)
        {
            await fetchMe();
        }

        setStarting(false);
    }

    useEffect(() => {
        init();

    }, []);

    if(loading || Starting)
    {
        return <div className="flex h-screen items-center justify-center">Đang tải trang...</div>
    }

    if(!accessToken)
    {
        return (
            <Navigate
                to="/signin" 
                replace
            />

        )
    }

    return (
        <Outlet></Outlet>
    )

};

export default ProtectedRoute;