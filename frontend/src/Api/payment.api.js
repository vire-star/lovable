import axios from "axios"
import { baseUrl } from "./baseUrl.js"

export const createCheckOutApi = async(payload)=>{
    const res = await axios.post(`${baseUrl}/payment/create-checkout`,
        payload,
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )

    return res.data
}



export const paymentCompleteApi = async(payload)=>{
    const res =await axios.post(`${baseUrl}/payment/verify`,
        payload,
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}