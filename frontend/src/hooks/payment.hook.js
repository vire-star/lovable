
import { createCheckOutApi, paymentCompleteApi } from '@/Api/payment.api'
import{ useMutation, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'

import { toast } from 'sonner'

export const useCreatePaymentHook = ()=>{
    return useMutation({
        mutationFn:createCheckOutApi,
        onSuccess:(data)=>{
            console.log(data)
             window.location.href=data.url
        },
        onError:(err)=>{
            console.log(err)
            toast.error(err?.response?.data?.error)
        }
    })
}




export const usePaymentVerifyHook = ()=>{
    const queryClient = useQueryClient()
    const navigate = useNavigate()
    return useMutation({
        mutationFn:paymentCompleteApi,
        onSuccess:(data)=>{
            console.log(data)
            toast.success(data.message)
            queryClient.invalidateQueries(['getUser'])
            navigate('/')

        },
        onError:(err)=>{
           toast.error(err?.response?.data?.error)
        }
    })
}