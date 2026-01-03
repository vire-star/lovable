// import { devtools } from "globals";
import { create } from "zustand";
import { devtools } from "zustand/middleware";

export const useCodeStore =create(
    devtools((set)=>({
        code:null,
        setCode:(newCode)=>set({code:newCode}),
        clearCode:()=>set({code:null})
    }),
    { name: "CodeStore" }
));