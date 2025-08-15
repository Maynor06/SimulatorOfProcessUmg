import React, { useEffect, useState } from 'react';
import '../Styles/FormPreceso.css'
import { useProcesoContext } from '../Context/ProcesoContext';

const FormProceso = () => {

    const { agregarProceso, procesos } = useProcesoContext();
    const [formData, setFormData] = useState({
        NombreProceso: '',
        MemoriaRequired: 0,
        Duration: 0
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value} = event.target;

        const valorParsed = name === "MemoriaRequired" || name === "Duration" ? parseInt(value) || 0: value;
        setFormData({...formData, [name]: valorParsed})
    }

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const newProceso = {
            PID: Date.now(),
            ...formData
        };

        agregarProceso(newProceso)

        setFormData({
            NombreProceso: '',
            MemoriaRequired: 0,
            Duration: 0
        })
    }

    useEffect(() => {
        console.log(procesos)
    }, [procesos])

    return (
        <div className="contain-form" >
            <h1 className='font-bold text-2xl' >Crea un nuevo Proceso</h1>
            <div className='formContain' >
                <form className="form" onSubmit={handleSubmit} >
                    <input type="text" className='shadow-2xl' value={formData.NombreProceso}  name="NombreProceso" onChange={handleChange} placeholder="Ingresa el nombre del proceso"  />
                    <input type="number" className='shadow-' value={formData.MemoriaRequired === 0 ? '': formData.MemoriaRequired} name='MemoriaRequired' onChange={handleChange} placeholder="Ingresa la memoria requerida (MB)" />
                    <input type="text" className='shadow-' value={formData.Duration === 0 ? '': formData.Duration} name='Duration' onChange={handleChange} placeholder="Duración (s)" />
                    <button type="submit">Crear Proceso</button>
                </form>
            </div>
        </div>
    );
}
export default FormProceso;
