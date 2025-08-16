import React, { useEffect, useState } from 'react';
import '../styles/FormProceso.css'
import { useProcesoContext } from '../context/ProcesoContext';

const FormProceso = () => {

    const { agregarProceso, procesos } = useProcesoContext();
    const [formData, setFormData] = useState({
        NombreProceso: '',
        MemoriaRequired: 0,
        Duration: 0
    });

    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const valorParsed = name === "MemoriaRequired" || name === "Duration" ? parseInt(value) || 0 : value;
        setFormData({ ...formData, [name]: valorParsed });
    };


    //Codigo relacionado al nombre aleatorio
    const [contador, setContador] = useState(1);

    const generarNombreProceso = () => {
        // Devuelve Task con número en formato 3 dígitos
        return `Task${String(contador).padStart(4, "0")}`;
    };


    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        // genera un nombre aleatorio, si el campo esta vacio
        const nombreFinal = formData.NombreProceso.trim() || generarNombreProceso();

        if (formData.MemoriaRequired <= 0) {
            setErrorMessage('La memoria requerida debe ser mayor a 0.');
            setShowModal(true);
            return;
        }

        if (formData.MemoriaRequired >= 1024) {
            setErrorMessage('La memoria requerida debe ser menor a 1024MB (1GB).');
            setShowModal(true);
            return;
        }

        if (formData.Duration <= 0) {
            setErrorMessage('La duración debe ser mayor a 0 segundos.');
            setShowModal(true);
            return;
        }

        if (formData.Duration > 60) {
            setErrorMessage('La duración debe ser menor a 60 segundos.');
            setShowModal(true);
            return;
        }

        const newProceso = {
            PID: Date.now(),
            ...formData,
            // si estaba vacío, se genera automáticamente
            NombreProceso: nombreFinal 
        };

        agregarProceso(newProceso);

        // Incrementa el contador
        if (!formData.NombreProceso.trim()) {
            setContador(contador + 1);
        }

        //Limpia los campos
        setFormData({
            NombreProceso: '',
            MemoriaRequired: 0,
            Duration: 0
        });
    };

    useEffect(() => {
        console.log(procesos);
    }, [procesos]);

    return (
        <div className="contain-form">
            <h1 className='font-bold text-2xl'style= {{fontFamily: "'Coiny', system-ui"}}>Crea un nuevo Proceso</h1>
            <div className='formContain'>

                <form className="form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className='shadow-2xl'
                        value={formData.NombreProceso}
                        name="NombreProceso"
                        onChange={handleChange}
                        placeholder="Ingresa el nombre del proceso"
                    />

                    <input
                        type="number"
                        className='shadow-'
                        value={formData.MemoriaRequired === 0 ? '' : formData.MemoriaRequired}
                        name='MemoriaRequired'
                        onChange={handleChange}
                        placeholder="Memoria requerida (MB)"
                    />

                    <input
                        type="number"
                        className='shadow-'
                        value={formData.Duration === 0 ? '' : formData.Duration}
                        name='Duration'
                        onChange={handleChange}
                        placeholder="Duración (s)"
                    />
                    <button className="font-semibold" type="submit" style={{ fontFamily: "'Rubik 80s Fade', system-ui" }}>Crear Proceso</button>
                </form>
            </div>

            {/* Modal de error */}

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
        </div>
    );
};

export default FormProceso;
