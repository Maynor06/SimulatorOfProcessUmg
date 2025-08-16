import BarraSimulatorProcess from "./BarraSimulatorProcess"


export const Simulator = () => {

    return(
        <div style={{
            minHeight: '100vh',
            background: `
                repeating-linear-gradient(0deg, #e5e7eb 0px, #e5e7eb 1px, transparent 10px, transparent 40px),
                repeating-linear-gradient(90deg, #e5e7eb 0px, #e5e7eb 1px, transparent 10px, transparent 40px)
            `
        }}>
            <nav className="w-full bg-violet-100 border-b-2 border-violet-300 py-5 mb-2 flex items-center justify-center rounded-t-2xl">
                <h1 className="text-4xl font-bold text-violet-700" style={{ fontFamily: "'Coiny', sans-serif" }}>Ejecutando:</h1>
            </nav>
            <div className="h-8" />
            <BarraSimulatorProcess/>
            <button onClick={() => window.location.href = '/'} className="bg-violet-300 h-10 w-35 rounded-2xl absolute top-5 left-5" style={{ fontFamily: "'Rubik 80s Fade', system-ui" }}>
                Regresar</button>
        </div>
    )
}