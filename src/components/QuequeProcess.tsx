import { useProcesoContext } from "../context/ProcesoContext";


const QuequeProcess = () => {

    const { procesos } = useProcesoContext();


    return (
        <>
            <div className="bg-transparent w-[400px] h-[550px] rounded-2xl " >
                {procesos.length != 0 ?
                    <>
                        <h1 className="text-3xl font-bold text-center " >Procesooos</h1>
                        {procesos.map((proceso, index) => (
                            <div key={index} className="bg-[#F8F8FF] w-[85%] p-4 ml-auto mr-auto mt-6 text-center rounded-2xl shadow-2xl " >
                                <p className="text-[#A9A9A9] text-[12px] " >{proceso.PID} </p>
                                <h2 className="font-bold text-2xl " >{proceso.NombreProceso}</h2>
                                <p className="text-[17px] " >Memoria requerida: {proceso.MemoriaRequired} Mb</p>
                                <p>Duracion:  {proceso.Duration}s </p>
                            </div>
                        )
                        )}
                    </> : <div className="text-center" >
                        Actualmente no tienes procesos creados :(
                    </div>}
            </div>
        </>
    )
}

export default QuequeProcess
