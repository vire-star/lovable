import { getUserApi, loginApi, logoutApi, registerApi } from '@/Api/user.api'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'


export const useRegisterHook = ()=>{
    return useMutation({
        mutationFn:registerApi,
        onSuccess:(data)=>{
            console.log(data)
        },
        onError:(err)=>{
            console.log(err)
        }
    })
}


export const useLoginHook = ()=>{
    const navigate = useNavigate()
    return useMutation({
        mutationFn:loginApi,
        onSuccess:(data)=>{
            navigate('/')
        },
        onError:(err)=>{
            console.log(err)
        }
    })
}


export const useGetUserHook = ()=>{
    return useQuery({
        queryKey:['getUser'],
        queryFn:getUserApi,
        retry:false
    })
}


export const useLogoutHook = ()=>{
    return useMutation({
        mutationFn:logoutApi,
        onSuccess:(data)=>{
            console.log(data)
        },
        onError:(err)=>{
            console.log(err)
        }
    })
}