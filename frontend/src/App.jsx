import React from 'react'
import { Button } from './components/ui/button'
import MainRoutes from './routes/MainRoutes'
import Navbar from './components/Navbar'
import { useLocation } from 'react-router-dom'

const App = () => {
  const hiddenRoutes = ['/login', '/register']
  const location = useLocation()
  const shouldHideNavbar = hiddenRoutes.includes(location.pathname)
  return (
    <div>
      {!shouldHideNavbar && <Navbar/>}
     <MainRoutes/>
    </div>
  )
}

export default App