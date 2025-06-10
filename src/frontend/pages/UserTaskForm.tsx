// src/components/UserTaskForm.tsx
import React, { useState, useEffect } from 'react';
import { camundaController } from '../controllers/camundaController';

interface UserTaskFormProps {
    processInstanceId: string; // ID instance procesa koju pratimo
    // Opcionalno: Možeš dodati callback kad nema više taskova
    onNoTasksFound?: () => void;
}

const UserTaskForm: React.FC<UserTaskFormProps> = ({ processInstanceId, onNoTasksFound }) => {
    const [task, setTask] = useState<any>(null); // State za trenutni aktivni task
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTermin, setSelectedTermin] = useState<string>(''); // State za odabrani termin

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true); // Postavi loading status
                // Dohvati aktivne taskove za ovu instancu procesa
                const tasks = await camundaController.getUserTasks(processInstanceId);
                if (tasks && tasks.length > 0) {
                    setTask(tasks[0]); // Pretpostavljamo da je samo jedan aktivni task u isto vrijeme
                } else {
                    setTask(null); // Nema aktivnih taskova
                    if (onNoTasksFound) {
                        onNoTasksFound(); // Obavijesti roditelja da nema više taskova
                    }
                }
            } catch (err: any) {
                console.error('Greška pri dohvatu korisničkog zadatka:', err);
                setError(err.message || 'Greška pri dohvatu zadatka.');
            } finally {
                setLoading(false); // Završi loading
            }
        };

        fetchTask(); // Odmah dohvati task pri mountanju komponente
        // Postavi interval za povremeno provjeravanje novih taskova
        const interval = setInterval(fetchTask, 3000); // Svakih 3 sekunde provjeri stanje
        return () => clearInterval(interval); // Očisti interval kad se komponenta unmounta
    }, [processInstanceId, onNoTasksFound]); // Ovisi o processInstanceId i onNoTasksFound

    const handleCompleteTask = async () => {
        if (!task) {
            alert('Nema aktivnog zadatka za dovršetak.');
            return;
        }
        if (!selectedTermin && task.name === 'Odaberi jedan od slobodnih termina') {
            alert('Molimo odaberite termin.');
            return;
        }

        try {
            // Varijable koje šaljemo Camundi prilikom dovršetka taska
            const variablesToComplete = {
                selectedAppointment: { value: selectedTermin, type: 'String' }
                // Možeš dodati i druge varijable ako su potrebne za daljnji tijek procesa
            };

            // Pozovi metodu za dovršetak taska putem kontrolera
            await camundaController.completeUserTask(task.id, variablesToComplete);
            alert(`Zadatak '${task.name}' uspješno dovršen!`);
            setTask(null); // Ukloni task iz state-a nakon dovršetka
            setSelectedTermin(''); // Resetiraj odabrani termin
            // Nema potrebe za window.location.reload() jer će useEffect ponovno provjeriti
        } catch (err: any) {
            console.error('Greška pri dovršetku zadatka:', err);
            alert(`Greška pri dovršetku zadatka: ${err.message}`);
        }
    };

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Učitavanje zadataka...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Greška: {error}</div>;
    }

    if (!task) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>
            Nema aktivnih zadataka za ovu instancu procesa. Proces je možda završen ili je na Service Tasku.
        </div>;
    }

    // Renderiranje forme ovisno o imenu taska (ili formKey-u iz BPMN-a)
    // Ovdje ćeš dodati uvjetno renderiranje za različite User Taskove
    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
            <h2>User Task: {task.name}</h2>
            <p>Process Instance ID: {processInstanceId}</p>

            {/* Specifična forma za task 'Odaberi jedan od slobodnih termina' */}
            {task.name === 'Odaberi jedan od slobodnih termina' && (
                <div>
                    <p>Pacijent: **{task.variables?.patientName || 'N/A'}** ({task.variables?.patientEmail || 'N/A'})</p>
                    <h3>Dostupni termini:</h3>
                    {/* Provjeri je li availableAppointments niz i je li prazan */}
                    {task.variables?.availableAppointments && Array.isArray(task.variables.availableAppointments) && task.variables.availableAppointments.length > 0 ? (
                        <select
                            value={selectedTermin}
                            onChange={(e) => setSelectedTermin(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">Odaberite termin</option>
                            {/* Mapiraj elemente niza u <option> tagove */}
                            {task.variables.availableAppointments.map((termin: string, index: number) => (
                                <option key={index} value={termin}>
                                    {termin}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p>Nema dostupnih termina. Molimo kontaktirajte podršku.</p>
                    )}
                    <button
                        onClick={handleCompleteTask}
                        style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            padding: '10px 15px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '16px'
                        }}
                    >
                        Dovrši odabir termina
                    </button>
                </div>
            )}

            {/* Ovdje možeš dodati i druge `else if` blokove za druge User Taskove s njihovim specifičnim formama */}
            {/* Primjer:
            {task.name === 'Potvrdi zakazivanje' && (
                <div>
                    <p>Potvrdite termin za {task.variables?.patientName} na {task.variables?.selectedAppointment}.</p>
                    <button onClick={handleCompleteTask}>Potvrdi</button>
                </div>
            )}
            */}
        </div>
    );
};

export default UserTaskForm;