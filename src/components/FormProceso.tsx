import React, { useEffect, useState } from 'react';
import '../styles/FormProceso.css'
import { useProcesoContext } from '../context/ProcesoContext';

const FormProceso = () => {

    const { agregarProceso, procesos } = useProcesoContext();
    const [formData, setFormData] = useState({
        NombreProceso: '',
        MemoriaRequired: 0,
        Duration: 0,
        tiempo_Entrada: 0,
        Algoritmo: '',
         Quantum: 0
    });

    const [showModal, setShowModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');

    const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement> ) => {
        const { name, value } = event.target;
        const valorParsed = name === "MemoriaRequired" || name === "Duration" || name == 'quantum' || name === 'tiempo_Entrada' ? parseInt(value) || 0 : value;
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

        // validar algoritmo
        if (!formData.Algoritmo) {
        setErrorMessage('Debe seleccionar un algoritmo de planificación.');
        setShowModal(true);
        return;
        }

        // si RoundRobin validar Quantum
        if (formData.Algoritmo === 'RoundRobin' && formData.Quantum <= 0) {
        setErrorMessage('Ingrese un quantum válido (mayor a 0) para Round Robin.');
        setShowModal(true);
        return;
        }

        // (opcional) validar tiempo_Entrada no negativo
        if (formData.tiempo_Entrada < 0) {
        setErrorMessage('Tiempo de entrada no puede ser negativo.');
        setShowModal(true);
        return;
        }


        const newProceso = {
            PID: Date.now(),
            ...formData,
            // si estaba vacío, se genera automáticamente
            NombreProceso: nombreFinal,
            Algoritmo: formData.Algoritmo as "" | "FCFS" | "SJF" | "SRTF" | "RoundRobin"
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
            Duration: 0,
            tiempo_Entrada: 0,
            Algoritmo: '',
            Quantum: 0
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
                    
                    <input
                    type="number"
                    className='shadow-'
                    value={formData.tiempo_Entrada === 0 ? '' : formData.tiempo_Entrada}
                    name='tiempo_Entrada'
                    onChange={handleChange}
                    placeholder="Tiempo de entrada (s)"
                    />


                    <label
                    htmlFor="Algoritmo"
                    style={{
                        display: 'block',
                        marginTop: '12px',
                        marginBottom: '4px',
                        fontWeight: '600',
                        fontSize: '1rem',
                        color: '#333',
                        letterSpacing: '0.5px'
                    }}
                    >
                    Algoritmo de planificación
                    </label>


                    <select
                    id="Algoritmo"
                    name="Algoritmo"
                    value={formData.Algoritmo}
                    onChange={handleChange}
                    style={{
                        width: '100%',
                        padding: '8px 12px',
                        marginTop: '4px',
                        marginBottom: '12px',
                        borderRadius: '6px',
                        border: '1px solid #ccc',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        fontSize: '1rem',
                        color: '#333',
                        backgroundColor: '#fff',
                        cursor: 'pointer'
                    }}
                    >
                    <option value="">-- Selecciona Algoritmo --</option>
                    <option value="FCFS">FCFS</option>
                    <option value="SJF">SJF</option>
                    <option value="SRTF">SRTF</option>
                    <option value="RoundRobin">Round Robin</option>
                    </select>



                    {formData.Algoritmo === 'RoundRobin' && (
                    <input
                        type="number"
                        className='shadow-'
                        name="Quantum"
                        value={formData.Quantum === 0 ? '' : formData.Quantum}
                        onChange={handleChange}
                        placeholder="Quantum (s)"
                        style={{ marginTop: '8px' }}
                    />
                    )}



                    <button type="submit" style={{ fontFamily: "'Coiny', system-ui" }}>Crear Proceso</button>
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
