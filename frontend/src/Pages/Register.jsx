import { useRegisterHook } from '@/hooks/user.hook'
import React from 'react'
import { useForm } from 'react-hook-form'

const Register = () => {
    const {register, handleSubmit} = useForm()

    const {mutate}  = useRegisterHook() 
    const registerHandler=(data)=>{
        mutate(data)
    }

  return (
     <div className='h-screen w-screen flex items-center justify-center'>

        <form onSubmit={handleSubmit(registerHandler)} action="" className='flex flex-col  p-6 rounded-md border border-slate-800'>
            <input type="text" placeholder='Enter your name' {...register('name')}/>
            <input type="email" placeholder='Enter your email' {...register('email')}/>
            <input type="password" placeholder='Enter your email' {...register('password')}/>
            <button type='submit' className='px-2 py-1 rounded-md bg-zinc-900 text-zinc-50'>
                register
            </button>
        </form>

    </div>
  )
}

export default Register