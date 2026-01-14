// frontend/src/Store/UserStore.js

import { create } from "zustand"
import { devtools, persist } from "zustand/middleware"

export const userStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        
        // ✅ Set user
        setUser: (newUser) => {
          // console.log('✅ Setting user:', newUser)
          set({ user: newUser })
        },
        
        // ✅ Clear user - Production safe
        clearUser: () => {
          // console.log('🚪 Clearing user from store')
          
          // Clear Zustand state
          set({ user: null })
          
        
         
        }
      }),
      {
        name: 'user-storage', // ✅ localStorage key
        version: 1, // ✅ Version for migrations
        
        // ✅ Only persist user field
        partialize: (state) => ({ 
          user: state.user 
        }),
        
        // ✅ Production-safe storage
        storage: {
          getItem: (name) => {
            try {
              const str = localStorage.getItem(name)
              return str ? JSON.parse(str) : null
            } catch (error) {
              console.error('❌ Error reading from localStorage:', error)
              return null
            }
          },
          setItem: (name, value) => {
            try {
              localStorage.setItem(name, JSON.stringify(value))
            } catch (error) {
              console.error('❌ Error writing to localStorage:', error)
            }
          },
          removeItem: (name) => {
            try {
              localStorage.removeItem(name)
            } catch (error) {
              console.error('❌ Error removing from localStorage:', error)
            }
          }
        }
      }
    ),
    { name: "UserStore" }
  )
)
