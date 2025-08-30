import { useNavigate } from "react-router";
import FormProceso from "./FormProceso";
import QuequeProcess from "./QuequeProcess";
import logo from "../assets/Logo(1).png";
import { useProcesoContext } from "../context/ProcesoContext";
import { useState } from "react";

const Home = () => {

    const navigate = useNavigate()
    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("")

    const { procesos } = useProcesoContext();

    const irASimulator = () => {
        if(procesos.length === 0){
            setErrorMessage('No tienes procesos creados :´(');
            setShowModal(true);
            return;               
        }
        navigate("/simulador")
    }

    return (
        <>
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]">
                    <img className="absolute top-5 left-0 right-225 mx-auto mt-4 w-24 h-24" src={logo} alt="Logo" />
                    <h1 className="relative top-8 text-6xl font-bold text-center" style={{ fontFamily: "'Coiny', sans-serif" }}>Simulador</h1>
                    <h1 className="relative top-8 text-5xl font-bold text-center" style={{ fontFamily: "'Coiny', sans-serif" }}>Gestor de Procesos en Memoria</h1>
                    <div className="flex gap-10 justify-center items-start mt-10" >
                        <div className="flex flex-col items-center">
                            <FormProceso />
                            <div className="h-8" />
                            <button onClick={irASimulator} className="bg-[#d7c8ff] transition-all duration-[2000ms] hover:scale-110 hover:bg-blue-200 h-12 w-56 rounded-2xl text-xl " style={{ fontFamily: "'Coiny', system-ui" }}>
                                Iniciar Simulación
                            </button>
                        </div>
                        <QuequeProcess />
                    </div>

                </div>
            </div>
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                strokeWidth={2}
                                stroke="red"
                                width="50"
                                height="50"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 
                           9 0 0118 0z"
                                />
                            </svg>
                            {/* <h2 style={{ color: 'red', margin: 0 }}>Error</h2>*/}
                        </div>
                        <p style={{ marginTop: '10px' }}>{errorMessage}</p>
                        <button onClick={() => setShowModal(false)}>Cerrar</button>
                    </div>
                </div>
            )}
        </>
    );
}

export default Home;