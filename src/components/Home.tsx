import { useNavigate } from "react-router";
import FormProceso from "./FormProceso";
import QuequeProcess from "./QuequeProcess";
import { Simulator } from "./Simulator";
import logo from "../assets/logo(1).png";

const Home = () => {

    const navigate = useNavigate()

    const irASimulator = () => {
        navigate("/simulador")
    }

    return (
        <>
            <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem]">
                <div className="absolute bottom-0 left-0 right-0 top-0 bg-[radial-gradient(circle_800px_at_100%_200px,#d5c5ff,transparent)]">
                    <img className="absolute top-5 left-0 right-225 mx-auto mt-4 w-24 h-24" src={logo} alt="Logo" />
                    <h1 className="relative top-8 text-6xl font-bold text-center" style={{ fontFamily: "'Coiny', sans-serif" }}>Simulador</h1>
                    <h1 className="relative top-8 text-5xl font-bold text-center" style={{ fontFamily: "'Coiny', sans-serif" }}>Gestor de Procesos en Memoria</h1>
                    <div className="flex gap-8 justify-center items-center mt-10" >
                        <FormProceso />
                        <QuequeProcess />
                    </div>
                    <div className="flex justify-center " >
                        <button onClick={irASimulator} className="bg-[#d7c8ff] transition-all duration-[2000ms] hover:scale-110 hover:bg-blue-200 h-12 w-56 rounded-2xl text-xl font-medium ">
                            Iniciar Simulación
                        </button>
                    </div>

                </div>
            </div>
        </>
    );
}

export default Home;