import { useGetUserHook } from "@/hooks/user.hook"
import { userStore } from "@/Store/UserStore"
import { useEffect } from "react"
import { Navigate } from "react-router-dom"

export const ProtectRoute = ({children}) => {
    const {data,isLoading, isError} = useGetUserHook()
    const setUser  = userStore((state)=>state.setUser)

    useEffect(()=>{
        if(data){
            setUser(data)
        }
    },[data])

    if(isLoading){
        return <div>Loading...</div>
    }

    if(!data|| isError){
        return <Navigate to={'/'} replace/>
    }

    return children
}