import { BrowserRouter, Route, Routes } from "react-router"
import { ProcesoProvider } from "./context/ProcesoContext"
import Home from "./components/Home"
import { Simulator } from './components/Simulator'

const RouterComponent = () => {
    return(
        <ProcesoProvider>
            <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home/>} />
                <Route path="/simulador" element={<Simulator/>} />
            </Routes>
            </BrowserRouter>
        </ProcesoProvider>
    )
}

export default RouterComponent 