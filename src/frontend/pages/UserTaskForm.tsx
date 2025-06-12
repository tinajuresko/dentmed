// src/components/UserTaskForm.tsx
import React, { useState, useEffect } from 'react';
import { camundaController } from '../controllers/camundaController';

interface UserTaskFormProps {
    processInstanceId: string;
    onNoTasksFound?: () => void; // Ovaj callback ostaje, ali ga pažljivije koristimo
}

const UserTaskForm: React.FC<UserTaskFormProps> = ({ processInstanceId, onNoTasksFound }) => {
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTermin, setSelectedTermin] = useState<string>('');
    const [availableTermini, setAvailableTermini] = useState<string[]>([]);
    const [initialFetchDone, setInitialFetchDone] = useState(false);
    const [isOfferSent, setIsOfferSent] = useState(false); // NOVO: Praćenje je li ponuda 'poslana' (tj. manual task dovršen)

    const fetchTask = async () => {
        try {
            setLoading(true);
            const tasks = await camundaController.getUserTasks(processInstanceId);

            if (tasks && tasks.length > 0) {
                const fetchedTask = tasks[0];
                setTask(fetchedTask);
                console.log("Dohvaćen task:", fetchedTask);
                console.log("Varijable taska:", fetchedTask.variables);

                // Resetiramo status ponude kada dobijemo novi task
                if (fetchedTask.name !== 'Pošalji ponudu pacijentu') {
                    setIsOfferSent(false); 
                }
                
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
                setIsOfferSent(false); // Resetiraj kada nema aktivnih taskova
                console.log("Nema aktivnih zadataka za prikaz.");
                // Ovdje je ključno! Pozovi onNoTasksFound tek kada je proces ZAISTA gotov
                // Ovo se događa kada getUserTasks vrati prazan niz više puta zaredom, 
                // ili kada proces dođe do End Eventa. Za demo, pustit ćemo roditeljsku komponentu da se brine o "završetku".
                // UserTaskForm će samo prikazati "Nema aktivnih zadataka..."
            }
        } catch (err: any) {
            console.error('Greška pri dohvatu korisničkog zadatka:', err);
            setError(err.message || 'Greška pri dohvatu zadatka.');
        } finally {
            setLoading(false);
            setInitialFetchDone(true);
        }
    };

    useEffect(() => {
        fetchTask();
        const interval = setInterval(fetchTask, 3000); // Redovito provjerava taskove
        return () => clearInterval(interval);
    }, [processInstanceId]);

    const handleCompleteTask = async () => {
        if (!task) {
            alert('Nema aktivnog zadatka za dovršetak.');
            return;
        }

        let variablesToComplete: { [key: string]: any } = {};

        if (task.name === 'Odaberi jedan od dostupnih termina') {
            if (!selectedTermin) {
                alert('Molimo odaberite termin.');
                return;
            }
            variablesToComplete = {
                selectedAppointment: { value: selectedTermin, type: 'String' }
            };
        } 
        // Za "Pošalji ponudu pacijentu" nema posebnih varijabli za slanje prilikom dovršetka manual taska
        // jer on samo signalizira da je "ponuda poslana" (izvršena administrativna radnja).
        // Pacijentova potvrda se šalje zasebnim API pozivom.

        try {
            await camundaController.completeUserTask(task.id, variablesToComplete);
            alert(`Zadatak '${task.name}' uspješno dovršen!`);
            
            // Ako je dovršen "Pošalji ponudu pacijentu" task, postavi flag
            if (task.name === 'Pošalji ponudu pacijentu') {
                setIsOfferSent(true);
            } else {
                setTask(null); // Resetiraj task nakon dovršetka, da se ponovno fetchaju
            }
            // Nema potrebe za direktnim pozivanjem fetchTask() ovdje, jer interval to radi svakih 3 sekunde
            // i uhvatit će promjenu stanja procesa u Camundi
        } catch (err: any) {
            console.error('Greška pri dovršetku zadatka:', err);
            alert(`Greška pri dovršetku zadatka: ${err.message}`);
        }
    };

    // NOVO: Funkcija za rukovanje pacijentovom potvrdom/odbijanjem
    const handlePatientResponse = async (isConfirmed: boolean) => {
        // Moramo dobiti patientEmail. On je u varijablama procesa.
        // Npr., ako je "Pošalji ponudu pacijentu" upravo dovršen, trebali bismo imati patientEmail iz prethodnih varijabli.
        // Najsigurnije je da ga povučemo iz stanja roditeljske komponente (AppointmentsPage) ako ga tamo držimo,
        // ili da ga prosljeđujemo kao prop.
        // Za demo, pretpostavimo da je `patientEmail` dostupan iz varijabli trenutnog taska ili iz nekog šireg konteksta.
        // Trenutno `task.variables?.patientEmail` bi trebao biti dostupan ako je procesna varijabla.
        const currentPatientEmail = task?.variables?.patientEmail; 

        if (!currentPatientEmail) {
            alert('Nije moguće simulirati potvrdu: nedostaje pacijentov email.');
            return;
        }

        try {
            await camundaController.confirmPatientAppointment(currentPatientEmail, isConfirmed);
            alert(`Pacijent je ${isConfirmed ? 'potvrdio' : 'odbio'} termin.`);
            setIsOfferSent(false); // Resetiraj jer je pacijent reagirao
            // Nema potrebe za direktnim pozivanjem fetchTask(), interval će uhvatiti promjenu
        } catch (err: any) {
            console.error('Greška pri slanju pacijentove potvrde:', err);
            alert(`Greška pri slanju pacijentove potvrde: ${err.message}`);
        }
    };


    if (loading && !initialFetchDone) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Učitavanje zadataka...</div>;
    }

    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Greška: {error}</div>;
    }

    if (!task && initialFetchDone) {
        // Kada nema taskova, provjerite stanje procesa
        // Ovdje možete dodati dodatnu logiku ako je proces DOISTA završen
        // npr. pozvati onNoTasksFound() koji bi AppointmentsPage-u rekao da je proces završen.
        // Ali za ovaj demo, dovoljno je da komponenta prikaže poruku i čeka na novu provjeru.
        return <div style={{ textAlign: 'center', padding: '20px' }}>
            Nema aktivnih korisničkih zadataka za ovu instancu procesa. Proces je možda završen ili je na Service Tasku.
        </div>;
    }

    if (!task && !initialFetchDone) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Učitavanje zadataka...</div>;
    }


    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
            <h2>User Task: {task.name}</h2>
            <p>Process Instance ID: {processInstanceId}</p>

            {task.name === 'Odaberi jedan od dostupnih termina' && (
                <div>
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

    {/* NOVO: LOGIKA ZA MANUAL TASK "Pošalji ponudu pacijentu" */}
    {task.name === 'Pošalji ponudu pacijentu' && (
        <div>
            <p>Pacijent: **{task.variables?.patientName || 'N/A'}** ({task.variables?.patientEmail || 'N/A'})</p>
            <p>Potvrđeni termin: **{task.variables?.selectedAppointment || 'N/A'}**</p>

            {/* Gumb za admina da "dovrši" slanje ponude - ovo samo pomiče proces dalje */}
            {!isOfferSent && ( // Prikazuj samo ako ponuda još nije "poslana"
            <>
                <p>Administrator treba poslati ponudu pacijentu.</p>
                <button
                onClick={handleCompleteTask} // Ovo će postaviti isOfferSent na true
                style={{ /* ... tvoji stilovi ... */ marginBottom: '15px' }}
                >
                Dovrši 'Pošalji ponudu pacijentu' (Admin akcija)
                </button>
            </>
            )}

         {/* Ovi gumbi trebaju biti uvijek vidljivi kada je manual task aktivan */}
            <p style={{ fontWeight: 'bold', color: 'green', marginTop: '10px' }}>Simulirajte pacijentov odgovor:</p>
                <button
                onClick={() => handlePatientResponse(true)}
                style={{ /* ... tvoji stilovi ... */ marginRight: '10px' }}
                >
                Simuliraj Pacijentovu Potvrdu
                </button>
                <button
                onClick={() => handlePatientResponse(false)}
                style={{ /* ... tvoji stilovi ... */ }}
                >
                Simuliraj Pacijentovo Odbijanje
                </button>
        </div>
        )}

            {task.name === 'Ponovno predloži termin' && (
                <div>
                    <p style={{ color: 'orange', fontWeight: 'bold' }}>Pacijent je odbio termin. Molimo odaberite novi termin.</p>
                    <p>Pacijent: **{task.variables?.patientName || 'N/A'}** ({task.variables?.patientEmail || 'N/A'})</p>
                    {/* Ovdje bi se ponovno prikazao isti UI kao za "Odaberi jedan od dostupnih termina" */}
                    {/* Možete re-useati dio koda ili napraviti zasebnu komponentu za odabir termina */}
                    <h3>Dostupni termini:</h3>
                    {availableTermini && availableTermini.length > 0 ? (
                        <select
                            value={selectedTermin}
                            onChange={(e) => setSelectedTermin(e.target.value)}
                            style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
                        >
                            <option value="">Odaberite novi termin</option>
                            {availableTermini.map((termin: string, index: number) => (
                                <option key={index} value={termin}>
                                    {termin}
                                </option>
                            ))}
                        </select>
                    ) : (
                        <p>Nema dostupnih termina za ponovno predlaganje.</p>
                    )}
                    <button
                        onClick={handleCompleteTask} // Ovdje ćete ponovno poslati selectedAppointment
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
                        Dovrši 'Ponovno predloži termin'
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserTaskForm;