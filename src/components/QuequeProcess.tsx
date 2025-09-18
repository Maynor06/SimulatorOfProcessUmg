import { motion, AnimatePresence } from "framer-motion";
import { useProcesoContext } from "../context/ProcesoContext";

const QuequeProcess = () => {

    const { procesos, finalizarProceso } = useProcesoContext();


    return (
        <>
            <div className="bg-transparent w-[400px] h-[500px] rounded-3xl border-3 border-violet-300 overflow-hidden" >
                <h1 className="bg-transparent text-3xl font-bold text-center text-violet-400 border-b-2 w-fit ml-auto mr-auto " style={{ fontFamily: "'Coiny', sans-serif" }} >Procesos a ejecutar</h1>
                <div className="bg-transparent" style={{height: '470px', overflowY: 'auto', paddingRight: '8px', paddingBottom: '12px'}}>
                    <AnimatePresence>
                                {procesos.map((proceso) => (
                                <motion.div
                                    key={proceso.PID}
                                    initial={{ opacity: 0, y: 50 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -50 }}
                                    transition={{ duration: 0.5 }}
                                    className="bg-[#F8F8FF] w-[85%] p-4 ml-auto mr-auto mt-6 mb-2 text-center rounded-2xl shadow-lg border border-gray-200"
                                >
                                    <div className="flex flex-col items-center mb-2">
                                    <span className="text-[#A9A9A9] text-sm font-mono">{proceso.PID}</span>
                                    <h2 className="font-bold text-xl">{proceso.NombreProceso}</h2>
                                    </div>

                                    {/* Información principal en badges */}
                                    <div className="flex flex-wrap justify-center gap-2 mb-3">
                                    <span className="px-2 py-1 bg-violet-200 text-violet-800 rounded-full text-sm">
                                        Memoria: {proceso.MemoriaRequired} MB
                                    </span>
                                    <span className="px-2 py-1 bg-green-200 text-green-800 rounded-full text-sm">
                                        Duración: {proceso.Duration}s
                                    </span>
                                    <span className="px-2 py-1 bg-blue-200 text-blue-800 rounded-full text-sm">
                                        Entrada: {proceso.tiempo_Entrada}s
                                    </span>
                                    <span className="px-2 py-1 bg-yellow-200 text-yellow-800 rounded-full text-sm">
                                        Algoritmo: {proceso.Algoritmo || "N/A"}
                                    </span>
                                    {proceso.Algoritmo === "RoundRobin" && (
                                        <span className="px-2 py-1 bg-orange-200 text-orange-800 rounded-full text-sm">
                                        Quantum: {proceso.Quantum}s
                                        </span>
                                    )}
                                    </div>

                                    {/* Botón eliminar */}
                                    <button
                                    className="mt-2 px-4 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                                    onClick={() => finalizarProceso(proceso.PID)}
                                    >
                                    Eliminar
                                    </button>
                                </motion.div>
                                ))}

                    </AnimatePresence>
                </div>
            </div>
        </>
    )
}

export default QuequeProcess
