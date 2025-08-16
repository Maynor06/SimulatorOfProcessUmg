
import { useEffect, useState, useRef } from "react";
import { useProcesoContext } from "../context/ProcesoContext";
import { motion, AnimatePresence } from "framer-motion";

type ProcesoCorriendo = {
    PID: number;
    NombreProceso: string;
    MemoriaRequired: number;
    Duration: number;
    isRunning: boolean;
    isDone: boolean;
    startTime?: number; 
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
        <>
        <div className="flex gap-8 justify-center">
            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Historial de procesos ejecutados</h2>
                <div className="py-4" style={{ height: '380px', overflowY: 'auto' }} >
                    <AnimatePresence>
                        {procesosEjecutados.length === 0 ? (
                            <motion.div className="text-gray-500 text-3xl text-center">No hay procesos ejecutados.</motion.div>
                        ) : (
                            procesosEjecutados.map(proceso => (
                                <motion.div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-yellow-100 relative">
                                    <div className="font-bold text-center">{proceso.NombreProceso}</div>
                                    <div className="ml-4" > <strong>PID:</strong> {proceso.PID}</div>
                                    <div className="ml-4"><strong>Memoria:</strong> {proceso.MemoriaRequired} MB</div>
                                    <div className="ml-4"><strong>Duración:</strong> {proceso.Duration}s </div>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} className="absolute top-10 left-[80%]" viewBox="0 0 24 24"><path fill="#00f70f" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"></path></svg>                                </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Procesos ejecutándose</h2>
                <h2  >Memoria ram disponible: {ram}</h2>
                <div className="py-4" style={{ height: '380px' }}>
                    <AnimatePresence>
                        {procesosCorriendo.length === 0 ? (
                            <motion.div className="text-gray-500 text-3xl text-center ">No hay procesos en ejecución :´(</motion.div>
                        ) : (
                            procesosCorriendo.map(proceso => (
                                <motion.div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-green-100  relative ">
                                    <div className="font-bold text-center">{proceso.NombreProceso}</div>
                                    <div className="ml-4" ><strong>PID:</strong> {proceso.PID}</div>
                                    <div className="ml-4"><strong>Memoria:</strong> {proceso.MemoriaRequired} MB</div>
                                    <div className="ml-4"><strong>Duración:</strong> {proceso.Duration}s</div>
                                    <div>
                                        {proceso.isRunning ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} className="absolute top-10 left-[80%] " viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeDasharray={16} strokeDashoffset={16} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0"></animate><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform></path></svg>
                                        ) : (
                                            <span className="text-gray-600">En espera</span>
                                        )}
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Procesos en cola</h2>
                <div className="py-4" style={{ height: '380px' }}>
                    <AnimatePresence>
                        {procesosPendientes.length === 0 ? (
                            <motion.div className="text-gray-500 text-3xl text-center">No hay procesos en cola :´(</motion.div>
                        ) : (
                            procesosPendientes.map(proceso => (
                                <motion.div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-gray-100 relative">
                                    <div className="font-bold text-center">{proceso.NombreProceso}</div>
                                    <div className="ml-4" ><strong>PID:</strong> {proceso.PID}</div>
                                    <div className="ml-4" ><strong>Memoria:</strong> {proceso.MemoriaRequired} MB</div>
                                    <div className="ml-4"><strong>Duración:</strong> {proceso.Duration}s</div>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} className="absolute top-10 left-[80%]" viewBox="0 0 24 24"><g><path fill="currentColor" d="M7 3H17V7.2L12 12L7 7.2V3Z"><animate id="SVGFjnOndxt" fill="freeze" attributeName="opacity" begin="0;SVGn6mLadge.end" dur="2s" from={1} to={0}></animate></path><path fill="currentColor" d="M17 21H7V16.8L12 12L17 16.8V21Z"><animate fill="freeze" attributeName="opacity" begin="0;SVGn6mLadge.end" dur="2s" from={0} to={1}></animate></path><path fill="currentColor" d="M6 2V8H6.01L6 8.01L10 12L6 16L6.01 16.01H6V22H18V16.01H17.99L18 16L14 12L18 8.01L17.99 8H18V2H6ZM16 16.5V20H8V16.5L12 12.5L16 16.5ZM12 11.5L8 7.5V4H16V7.5L12 11.5Z"></path><animateTransform id="SVGn6mLadge" attributeName="transform" attributeType="XML" begin="SVGFjnOndxt.end" dur="0.5s" from="0 12 12" to="180 12 12" type="rotate"></animateTransform></g></svg>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
        </>
    );
};

export default BarraSimulatorProcess;
