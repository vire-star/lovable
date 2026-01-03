import React from 'react'
import { Button } from './components/ui/button'
import MainRoutes from './routes/MainRoutes'
import Navbar from './components/Navbar'

const App = () => {
  return (
    <div>
      <Navbar/>
     <MainRoutes/>
    </div>
  )
}

export default App