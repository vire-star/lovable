// import { createProjectApi } from '@/Api/project.api'
// // import { useMutation } from '@tanstack/react-query'

// export const useProjectHook = ()=>{
//     return useMutation({
//         mutationFn:createProjectApi,
//         onSuccess:(data)=>{
//             console.log(data)
//         },
//         onError:(err)=>{
//             console.log(err)
//         }
//     })
// }







// import { createProjectApi } from '@/Api/project.api'
// frontend/src/hooks/project.hook.js
// import { baseUrls } from '@/Api/baseUrls'
import { createProjectApi, getAllProjects, getProject, saveProjectApi } from '@/Api/project.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import { toast } from 'sonner'

// const baseUrls = '/api/project'
export const baseUrls = 'http://localhost/api'

// ✅ Generate code
export const useProjectHook = () => {
  return useMutation({
    mutationFn:createProjectApi,
    onSuccess:(data)=>{
      console.log(data)
    },
    onError:(err)=>{
      console.log(err?.response?.data?.message)
        toast.error(err?.response?.data?.message)
    }
  })
}

// ✅ Save project
export const useSaveProjectHook = () => {
  return useMutation({
    mutationFn:saveProjectApi,
    onSuccess:(data)=>{
      console.log(data)
    },
    onError:(err)=>{
      console.log(err)
      toast.error(err?.response?.data?.error)
    }
  })
}

// ✅ Get single project
export const useGetProjectHook = (projectId) => {
  return useQuery({
    queryKey: ['project', projectId],
    queryFn:()=>getProject(projectId),
    enabled: !!projectId
  })
}

// ✅ Get all projects
export const useGetAllProjectsHook = () => {
  return useQuery({
    queryFn:getAllProjects,
    queryKey: ['projects'],
  
  })
}



