import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const userStore = create(
   devtools((set)=>({
    user:null,
    setUser:(newUser)=>set({user:newUser}),
    clearUser:()=>set({user:null})
   }),
    { name: "UserStore" }

)
   
)