import axios from "axios"
import { baseUrl } from "./baseUrl"

export const registerApi = async(payload)=>{
    const res = await axios.post(`${baseUrl}/register`,
        payload,
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}
export const loginApi = async(payload)=>{
    const res = await axios.post(`${baseUrl}/login`,
        payload,
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}

export const getUserApi = async()=>{
    const res = await axios.get(`${baseUrl}/getUser`,
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )

    return res.data
}

export const logoutApi = async()=>{
    const res =await axios.post(`${baseUrl}/logout`,
        {},
        {
             headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}