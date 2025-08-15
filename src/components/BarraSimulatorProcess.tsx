
import { useEffect, useState, useRef } from "react";
import { useProcesoContext } from "../context/ProcesoContext";


type ProcesoCorriendo = {
    PID: number;
    NombreProceso: string;
    MemoriaRequired: number;
    Duration: number;
    isRunning: boolean;
    isDone: boolean;
    startTime?: number; // timestamp en ms
};

const BarraSimulatorProcess = () => {
    const { procesos, memoriaTotal } = useProcesoContext();
    const [ram, setRam] = useState(memoriaTotal);
    const [procesosCorriendo, setProcesosCorriendo] = useState<ProcesoCorriendo[]>([]);
    const [procesosPendientes, setProcesosPendientes] = useState<ProcesoCorriendo[]>([]);
    const [procesosEjecutados, setProcesosEjecutados] = useState<ProcesoCorriendo[]>([]);

    // Actualiza los arrays de corriendo y pendientes según la RAM y los ejecutados
    const actualizarColas = (procesosBase: ProcesoCorriendo[], ejecutados: ProcesoCorriendo[]) => {
        let ramDisponible = memoriaTotal;
        const corriendo: ProcesoCorriendo[] = [];
        const pendientes: ProcesoCorriendo[] = [];

        // Filtra los procesos que no han sido ejecutados
        const noEjecutados = procesosBase.filter(
            p => !ejecutados.some(e => e.PID === p.PID)
        );

        for (const proceso of noEjecutados) {
            if (ramDisponible >= proceso.MemoriaRequired) {
                ramDisponible -= proceso.MemoriaRequired;
                corriendo.push({ ...proceso, isRunning: true, isDone: false, startTime: Date.now() });
            } else {
                pendientes.push({ ...proceso, isRunning: false, isDone: false });
            }
        }
        setProcesosCorriendo(prev => {
            // Mantener startTime si el proceso ya estaba corriendo
            return corriendo.map(p => {
                const old = prev.find(o => o.PID === p.PID);
                return old && old.isRunning && !old.isDone && old.startTime ? { ...p, startTime: old.startTime } : p;
            });
        });
        setProcesosPendientes(pendientes);
        setRam(ramDisponible);
    };

    // Inicializa las colas al montar o cuando cambian los procesos/contexto
    useEffect(() => {
        // Convertir procesos del contexto a ProcesoCorriendo
        const procesosCorriendoBase: ProcesoCorriendo[] = procesos.map(p => ({
            ...p,
            isRunning: false,
            isDone: false
        }));
        actualizarColas(procesosCorriendoBase, procesosEjecutados);
        // eslint-disable-next-line
    }, [procesos, procesosEjecutados]);

    // Maneja la ejecución de los procesos corriendo
    // Timers persistentes por proceso

    const timersRef = useRef<Map<number, number>>(new Map());

    useEffect(() => {
        procesosCorriendo.forEach((proceso) => {
            if (proceso.isRunning && !proceso.isDone && proceso.startTime) {
                if (procesosEjecutados.some(e => e.PID === proceso.PID)) return;
                
                if (timersRef.current.has(proceso.PID)) return;

                // Calcular tiempo restante
                const elapsed = Date.now() - proceso.startTime;
                const remaining = proceso.Duration * 1000 - elapsed;
                if (remaining <= 0) {
                    setProcesosEjecutados(prev => {
                        if (prev.some(e => e.PID === proceso.PID)) return prev;
                        return [...prev, { ...proceso, isRunning: false, isDone: true }];
                    });
                    timersRef.current.delete(proceso.PID);
                    return;
                }
                const timerId = window.setTimeout(() => {
                    setProcesosEjecutados(prev => {
                        if (prev.some(e => e.PID === proceso.PID)) return prev;
                        return [...prev, { ...proceso, isRunning: false, isDone: true }];
                    });
                    timersRef.current.delete(proceso.PID);
                }, remaining);
                timersRef.current.set(proceso.PID, timerId);
            }
        });

        timersRef.current.forEach((timerId, pid) => {
            if (!procesosCorriendo.some(p => p.PID === pid && p.isRunning && !p.isDone)) {
                clearTimeout(timerId);
                timersRef.current.delete(pid);
            }
        });

        return () => {
            timersRef.current.forEach((timerId) => clearTimeout(timerId));
            timersRef.current.clear();
        };
    }, [procesosCorriendo, procesosEjecutados]);

    return (
        <div className="flex gap-8 justify-center">
            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Historial de procesos ejecutados</h2>
                <div>
                    {procesosEjecutados.length === 0 ? (
                        <div className="text-gray-500">No hay procesos ejecutados.</div>
                    ) : (
                        procesosEjecutados.map(proceso => (
                            <div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-green-100">
                                <div className="font-bold">{proceso.NombreProceso}</div>
                                <div>PID: {proceso.PID}</div>
                                <div>Memoria: {proceso.MemoriaRequired} MB</div>
                                <div>Duración: {proceso.Duration}s</div>
                                <div>
                                    <span className="text-green-700 font-bold">Ejecutado</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Procesos ejecutándose</h2>
                <div className="mb-4">RAM libre: <span className="font-mono">{ram} MB</span></div>
                <div>
                    {procesosCorriendo.length === 0 ? (
                        <div className="text-gray-500">No hay procesos en ejecución.</div>
                    ) : (
                        procesosCorriendo.map(proceso => (
                            <div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-gray-100">
                                <div className="font-bold">{proceso.NombreProceso}</div>
                                <div>PID: {proceso.PID}</div>
                                <div>Memoria: {proceso.MemoriaRequired} MB</div>
                                <div>Duración: {proceso.Duration}s</div>
                                <div>
                                    Estado: {proceso.isRunning ? (
                                        <span className="text-blue-600 font-bold">Ejecutando...</span>
                                    ) : (
                                        <span className="text-gray-600">En espera</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Procesos en cola</h2>
                <div>
                    {procesosPendientes.length === 0 ? (
                        <div className="text-gray-500">No hay procesos en cola.</div>
                    ) : (
                        procesosPendientes.map(proceso => (
                            <div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-yellow-100">
                                <div className="font-bold">{proceso.NombreProceso}</div>
                                <div>PID: {proceso.PID}</div>
                                <div>Memoria: {proceso.MemoriaRequired} MB</div>
                                <div>Duración: {proceso.Duration}s</div>
                                <div>
                                    <span className="text-yellow-700 font-bold">En cola</span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default BarraSimulatorProcess;
