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
    const [tiemposRestantes, setTiemposRestantes] = useState<Map<number, number>>(new Map());

    const timersRef = useRef<Map<number, number>>(new Map());

    // === Actualiza colas (pendientes / corriendo) ===
    const actualizarColas = (procesosBase: ProcesoCorriendo[], ejecutados: ProcesoCorriendo[]) => {
        let ramDisponible = memoriaTotal;
        const corriendo: ProcesoCorriendo[] = [];
        const pendientes: ProcesoCorriendo[] = [];

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

        setProcesosCorriendo(prev =>
            corriendo.map(p => {
                const old = prev.find(o => o.PID === p.PID);
                return old && old.isRunning && !old.isDone && old.startTime
                    ? { ...p, startTime: old.startTime }
                    : p;
            })
        );
        setProcesosPendientes(pendientes);
        setRam(ramDisponible);
    };

    // Inicializar colas al montar / cambiar procesos
    useEffect(() => {
        const procesosCorriendoBase: ProcesoCorriendo[] = procesos.map(p => ({
            ...p,
            isRunning: false,
            isDone: false
        }));
        actualizarColas(procesosCorriendoBase, procesosEjecutados);
        // eslint-disable-next-line
    }, [procesos, procesosEjecutados]);

    // === Manejo de timers y cuenta regresiva ===
    useEffect(() => {
        const interval = setInterval(() => {
            setTiemposRestantes(prev => {
                const nuevos = new Map(prev);

                procesosCorriendo.forEach(proceso => {
                    if (proceso.isRunning && !proceso.isDone && proceso.startTime) {
                        const elapsed = Math.floor((Date.now() - proceso.startTime) / 1000);
                        const remaining = Math.max(proceso.Duration - elapsed, 0);
                        nuevos.set(proceso.PID, remaining);

                        if (remaining === 0) {
                            setProcesosEjecutados(prevEjec => {
                                if (prevEjec.some(e => e.PID === proceso.PID)) return prevEjec;
                                return [...prevEjec, { ...proceso, isRunning: false, isDone: true }];
                            });
                        }
                    }
                });

                return nuevos;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [procesosCorriendo]);

    return (
        <div className="flex gap-8 justify-center">
            {/* === Historial de procesos ejecutados === */}
            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Historial de procesos ejecutados</h2>
                <div className="py-4" style={{ height: '380px', overflowY: 'auto' }}>
                    <AnimatePresence>
                        {procesosEjecutados.length === 0 ? (
                            <motion.div className="text-gray-500 text-3xl text-center">No hay procesos ejecutados.</motion.div>
                        ) : (
                            procesosEjecutados.map(proceso => (
                                <motion.div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-yellow-100 relative">
                                    <div className="font-bold text-center">{proceso.NombreProceso}</div>
                                    <div className="ml-4"><strong>PID:</strong> {proceso.PID}</div>
                                    <div className="ml-4"><strong>Memoria:</strong> {proceso.MemoriaRequired} MB</div>
                                    <div className="ml-4"><strong>Duración:</strong> {proceso.Duration}s</div>
                                    <div>
                                        <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} className="absolute top-10 left-[80%]" viewBox="0 0 24 24"><path fill="#00f70f" d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4z"></path></svg>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* === Procesos ejecutándose === */}
            <div className="bg-white p-4 rounded-xl shadow-xl w-[400px]">
                <h2 className="text-xl font-bold mb-2">Procesos ejecutándose</h2>
                <div className="py-4" style={{ height: '380px' }}>
                    <AnimatePresence>
                        {procesosCorriendo.length === 0 ? (
                            <motion.div className="text-gray-500 text-3xl text-center">No hay procesos en ejecución :´(</motion.div>
                        ) : (
                            procesosCorriendo.map(proceso => (
                                <motion.div key={proceso.PID} className="mb-3 p-3 rounded-lg shadow bg-green-100 relative">
                                    <div className="font-bold text-center">{proceso.NombreProceso}</div>
                                    <div className="ml-4"><strong>PID:</strong> {proceso.PID}</div>
                                    <div className="ml-4"><strong>Memoria:</strong> {proceso.MemoriaRequired} MB</div>
                                    <div className="ml-4"><strong>Duración:</strong> {proceso.Duration}s</div>
                                    <div className="ml-4 text-red-600">
                                        <strong>Tiempo restante:</strong> {tiemposRestantes.get(proceso.PID) ?? proceso.Duration}s
                                    </div>

                                    {/* Barra de progreso debajo del tiempo restante */}
<div style={{
  width: "100%",
  height: "10px",
  backgroundColor: "#ddd",
  borderRadius: "5px",
  marginTop: "5px",
  overflow: "hidden"
}}>
  <div
    style={{
      width: `${Math.min(
        ((proceso.Duration - (tiemposRestantes.get(proceso.PID) ?? proceso.Duration)) / proceso.Duration) * 100,
        100
      )}%`,
      height: "100%",
      backgroundColor: "green",
      transition: "width 1s linear"
    }}
  ></div>
</div>

                                    <div>
                                        {proceso.isRunning ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" width={48} height={48} className="absolute top-10 left-[80%]" viewBox="0 0 24 24"><path fill="none" stroke="currentColor" strokeDasharray={16} strokeDashoffset={16} strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3c4.97 0 9 4.03 9 9"><animate fill="freeze" attributeName="stroke-dashoffset" dur="0.2s" values="16;0"></animate><animateTransform attributeName="transform" dur="1.5s" repeatCount="indefinite" type="rotate" values="0 12 12;360 12 12"></animateTransform></path></svg>
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

            {/* === Procesos en cola === */}
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
                                    <div className="ml-4"><strong>PID:</strong> {proceso.PID}</div>
                                    <div className="ml-4"><strong>Memoria:</strong> {proceso.MemoriaRequired} MB</div>
                                    <div className="ml-4"><strong>Duración:</strong> {proceso.Duration}s</div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default BarraSimulatorProcess;
