import { createContext, useContext, useState, type ReactNode } from "react";

export interface Proceso {
    PID: number; 
    NombreProceso: string; 
    MemoriaRequired: number; 
    Duration: number;
}

interface PrecesoContextType {
    procesos: Proceso[];
    agregarProceso: (proceso: Proceso) => void;
    finalizarProceso: (pid: number) => void;
    memoriaTotal: number;
}

const ProcesoContext = createContext<PrecesoContextType | undefined>(undefined);

export const useProcesoContext = () => {
    const context = useContext(ProcesoContext);
    if(!context) {
        throw new Error("useProcesoContext debe usarse dentro de un ProcesoProvider")
    }
    return context;
}

interface ProcesoProviderProps {
    children: ReactNode;
}

export const ProcesoProvider = ({children}: ProcesoProviderProps) => {
    const MEMORIA_TOTAL = 1024; // 1GB en MB
    const [procesos, setProcesos] = useState<Proceso[]>([]);

    const agregarProceso = (proceso: Proceso) => {
        setProcesos(prev => [...prev, proceso])
    }

    const finalizarProceso = (pid: number) => {
        setProcesos(prev => prev.filter(p => p.PID !== pid));
    }

    return (
        <ProcesoContext.Provider value={{ procesos, agregarProceso, finalizarProceso, memoriaTotal: MEMORIA_TOTAL }} >
            {children}
        </ProcesoContext.Provider>
    )
}
