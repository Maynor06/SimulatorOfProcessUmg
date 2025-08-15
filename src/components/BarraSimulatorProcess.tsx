import { useEffect, useState } from "react";
import { useProcesoContext } from "../context/ProcesoContext";

const RAM_INICIAL = 1000; // Puedes ajustar el valor inicial de RAM

type ProcesoCorriendo = {
    PID: number;
    NombreProceso: string;
    MemoriaRequired: number;
    Duration: number;
    isRunning: boolean;
    isDone: boolean;
};

const BarraSimulatorProcess = () => {
    const [ram, setRam] = useState(RAM_INICIAL);
    const { procesos } = useProcesoContext();
    const [procesosCorriendo, setProcesosCorriendo] = useState<ProcesoCorriendo[]>([]);
    const [procesosPendientes, setProcesosPendientes] = useState<ProcesoCorriendo[]>([]);
    const [ejecutados, setEjecutados] = useState<number[]>([]);

    useEffect(() => {
        // Solo ejecuta el proceso que está corriendo actualmente
        const procesoActual = procesosCorriendo.find(p => p.isRunning && !p.isDone);
        if (!procesoActual) return;

        const timer = setTimeout(() => {
            setProcesosCorriendo(prev => prev.map(p =>
                p.PID === procesoActual.PID ? { ...p, isRunning: false, isDone: true } : p
            ));
            setRam(prevRam => Math.min(prevRam + procesoActual.MemoriaRequired, RAM_INICIAL));
            setEjecutados(prev => [...prev, procesoActual.PID]);
        }, procesoActual.Duration * 1000);

        return () => clearTimeout(timer);
    }, [procesosCorriendo]);

    useEffect(() => {
        // Calcular la cola y RAM localmente para evitar duplicados
        let ramDisponible = RAM_INICIAL;
        const nuevaCola: ProcesoCorriendo[] = [];
        const procesosPendientes = procesos.filter(
            (proceso) => !ejecutados.includes(proceso.PID)
        );

        for (const proceso of procesosPendientes) {
            if (ramDisponible >= proceso.MemoriaRequired) {
                ramDisponible -= proceso.MemoriaRequired;
                nuevaCola.push({ ...proceso, isRunning: true, isDone: false });
            }
        }

        setProcesosCorriendo(nuevaCola);
        setRam(ramDisponible);
        // eslint-disable-next-line
    }, [procesos, ejecutados]);

    // Procesos pendientes (en cola, no ejecutados ni corriendo)
    const pendientes = procesos.filter(
        (proceso) =>
            !ejecutados.includes(proceso.PID) &&
            !procesosCorriendo.some(p => p.PID === proceso.PID)
    );

    return (
        <div className="flex gap-8 justify-center">
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
                                    Estado: {proceso.isDone ? (
                                        <span className="text-green-600 font-bold">Ejecutado</span>
                                    ) : proceso.isRunning ? (
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
                    {pendientes.length === 0 ? (
                        <div className="text-gray-500">No hay procesos en cola.</div>
                    ) : (
                        pendientes.map(proceso => (
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
}

export default BarraSimulatorProcess;
