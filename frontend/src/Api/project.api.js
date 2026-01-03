import axios from "axios"
import { baseUrl } from "./baseUrl"

export const createProjectApi = async (payload) => {
  try {
    const res = await axios.post(
      `${baseUrl}/project/generate`,  // ✅ ADD /api here
      payload,
      {
        headers: { 'Content-Type': 'application/json' },
        withCredentials: true
      }
    )
    return res.data
  } catch (error) {
    console.error('❌ API Error:', error)
    throw error
  }
}
export const saveProjectApi = async(payload)=>{
     const res = await axios.put(`${baseUrl}/project/save`,
        payload,
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}

export const getProject=async(id)=>{
 const res = await axios.get(`${baseUrl}/project/${id}`,
        
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}


export const getAllProjects =  async()=>{
    const res = await axios.get(`${baseUrl}/project/`,
        
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}


export const deleteProject = async(id)=>{
     const res = await axios.delete(`${baseUrl}/project/${id}`,
        {},
        
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}


export const deployProject = async()=>{
    const res = await axios.post(`${baseUrl}/project/deploy`,
        {},
        
        {
            headers:{'Content-Type':'application/json'},
            withCredentials:true
        }
    )
    return res.data
}