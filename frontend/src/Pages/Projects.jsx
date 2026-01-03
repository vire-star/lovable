import { useGetAllProjectsHook } from '@/hooks/project.hook'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const Projects = () => {
    const {data} = useGetAllProjectsHook()
    const navigate = useNavigate()
    console.log(data)
  return (
    <div>
        <h1 className='text-3xl font-bold mb-6'>My Projects</h1>
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {data?.projects?.map((project)=>(
                <div key={project.id} onClick={()=>navigate(`/AI-room/${project.id}`)} className='p-4 border border-gray-300 rounded-lg shadow-md'>
                    <h2 className='text-xl font-semibold mb-2'>{project.name}</h2>  
                </div>
            ))}
        </div>
    </div>
  )
}

export default Projects