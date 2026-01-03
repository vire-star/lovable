import { getUserApi, loginApi, logoutApi, registerApi } from '@/Api/user.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'


export const useRegisterHook = ()=>{
    const navigate = useNavigate()
    return useMutation({
        mutationFn:registerApi,
        onSuccess:(data)=>{
            console.log(data)
            toast.success(data.message)
            navigate('/')
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
            toast.success(data.message)
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
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn:logoutApi,
        
        onSuccess:(data)=>{
            console.log(data)
            queryClient.invalidateQueries(['getUser'])
        },
        onError:(err)=>{
            console.log(err)
        }
    })
}