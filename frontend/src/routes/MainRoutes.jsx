import HomePage from '@/Pages/HomePage'
import LivePreview from '@/Pages/LivePreview'
import Login from '@/Pages/Login'
import Register from '@/Pages/Register'
import WorkingArea from '@/Pages/WorkingArea'
import React from 'react'
import { Route, Routes } from 'react-router-dom'
import { ProtectRoute } from './ProtectRoute'
import Projects from '@/Pages/Projects'

const MainRoutes = () => {
  return (
    <Routes>
        <Route path='/' element={<HomePage/>}/>
        <Route path='/login' element={<Login/>}/>
        <Route path='/register' element={<Register/>}/>
        <Route path='/AI-room/:id' element={

          <ProtectRoute>
            <WorkingArea/>
          </ProtectRoute>
        }/>
        <Route path='/projects' element={

          <ProtectRoute>
            <Projects/>
          </ProtectRoute>
        }/>
        
        <Route path='/live/:id' element={<LivePreview/>}/>
    </Routes>
  )
}

export default MainRoutes