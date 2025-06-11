// src/components/UserTaskForm.tsx
import React, { useState, useEffect } from 'react';
import { camundaController } from '../controllers/camundaController';

interface UserTaskFormProps {
    processInstanceId: string;
    onNoTasksFound?: () => void;
}

const UserTaskForm: React.FC<UserTaskFormProps> = ({ processInstanceId, onNoTasksFound }) => {
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTermin, setSelectedTermin] = useState<string>('');
    const [availableTermini, setAvailableTermini] = useState<string[]>([]);

    useEffect(() => {
        const fetchTask = async () => {
            try {
                setLoading(true);
                const tasks = await camundaController.getUserTasks(processInstanceId);
                if (tasks && tasks.length > 0) {
                    const fetchedTask = tasks[0];
                    setTask(fetchedTask);
                    console.log("Dohvaćen task:", fetchedTask);
                    console.log("Varijable taska:", fetchedTask.variables); // Trebale bi biti ispravno mapirane

                    // Ovdje je promjena: Ne treba JSON.parse() ako .NET već parsira!
                    // availableAppointments bi trebao biti array direktno
                    const appointments = fetchedTask.variables?.availableAppointments;

                    if (Array.isArray(appointments)) {
                        setAvailableTermini(appointments);
                        console.log("Dostupni termini:", appointments);
                    } else {
                        console.warn("availableAppointments nije array ili nedostaje:", appointments);
                        setAvailableTermini([]);
                    }

                } else {
                    setTask(null);
                    setAvailableTermini([]);
                    if (onNoTasksFound) {
                        onNoTasksFound();
                    }
                }
            } catch (err: any) {
                console.error('Greška pri dohvatu korisničkog zadatka:', err);
                setError(err.message || 'Greška pri dohvatu zadatka.');
            } finally {
                setLoading(false);
            }
        };

        fetchTask();
        const interval = setInterval(fetchTask, 3000);
        return () => clearInterval(interval);
    }, [processInstanceId, onNoTasksFound]);

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
            // Frontend sada šalje varijable u formatu koji .NET očekuje za CamundaVariable
            // Ime varijable (selectedAppointment) i njena vrijednost
            const variablesToComplete = {
                selectedAppointment: { value: selectedTermin, type: 'String' }
            };

            await camundaController.completeUserTask(task.id, variablesToComplete);
            alert(`Zadatak '${task.name}' uspješno dovršen!`);
            setTask(null);
            setAvailableTermini([]);
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

    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
            <h2>User Task: {task.name}</h2>
            <p>Process Instance ID: {processInstanceId}</p>

            {task.name === 'Odaberi jedan od slobodnih termina' && (
                <div>
                    {/* Patient Name i Email dolaze direktno kao stringovi iz .NET-a, ne kao { value: "..." } */}
                    <p>Pacijent: **{task.variables?.patientName || 'N/A'}** ({task.variables?.patientEmail || 'N/A'})</p>
                    <h3>Dostupni termini:</h3>
                    {availableTermini && availableTermini.length > 0 ? (
                        <select
                            value={selectedTermin}
                            onChange={(e) => setSelectedTermin(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">Odaberite termin</option>
                            {availableTermini.map((termin: string, index: number) => (
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
        </div>
    );
};

export default UserTaskForm;