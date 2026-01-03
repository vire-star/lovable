// import { useGetUserHook } from '@/hooks/user.hook'
import { userStore } from '@/Store/UserStore'
import React from 'react'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { useLogoutHook } from '@/hooks/user.hook'
import { useNavigate } from 'react-router-dom'

const Navbar = () => {
   
    // console.log(data)
    const user = userStore((state)=>state.user)
    const clearUser = userStore((state)=>state.clearUser)
    const navigate = useNavigate()
    // console.log(user)
    const {mutate} = useLogoutHook()
    const logoutHandler=()=>{
        mutate({},
            {
                onSuccess:(data)=>{
                    console.log(data)
                    navigate('/')
                    clearUser()
                }
            }
        )
    }
  return (
    <div className='flex items-center justify-between px-9 h-[10vh] shadow-2xl'>
        <h1>Buildly</h1>
        <div>
          {
            user? 
            <>
            <Popover>
                <PopoverTrigger>
            <h1>{user?.name}</h1>

                </PopoverTrigger>
                <PopoverContent>
                    <h1 className='cursor-pointer' onClick={(e)=>{
                        e.preventDefault()
                        logoutHandler()
                    }}>logout</h1>
                </PopoverContent>
            </Popover>

            <h1 onClick={()=>navigate('/projects')}>MY Projects</h1>
            
            </>
            :
            <>
            
              <button>Sign In</button>
            <button>Sign Up</button>
            </>
          }
        </div>
    </div>
  )
}

export default Navbar