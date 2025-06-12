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
    const [initialFetchDone, setInitialFetchDone] = useState(false);
    // NOVO: Označava da je ponuda (jednom) poslana i da se čeka pacijentov odgovor
    const [waitingForPatientResponse, setWaitingForPatientResponse] = useState(false); 
    const [patientEmail, setPatientEmail] = useState<string | null>(null); // Pohrani email pacijenta

    const fetchTask = async () => {
        try {
            setLoading(true);
            const tasks = await camundaController.getUserTasks(processInstanceId);

            if (tasks && tasks.length > 0) {
                const fetchedTask = tasks[0];
                setTask(fetchedTask);
                console.log("Dohvaćen task:", fetchedTask);
                console.log("Varijable taska:", fetchedTask.variables);

                // Ažuriraj patientEmail kada se task dohvati
                if (fetchedTask.variables?.patientEmail) {
                    setPatientEmail(fetchedTask.variables.patientEmail);
                }

                // Ako je task "Pošalji ponudu pacijentu", resetiraj waitingForPatientResponse na false
                // jer tek treba kliknuti gumb za dovršetak tog taska
                if (fetchedTask.name === 'Pošalji ponudu pacijentu') {
                    setWaitingForPatientResponse(false); 
                } else {
                    // Ako je neki drugi task (npr. Odaberi termin, ili Ponovno predloži),
                    // i ako smo prije čekali pacijenta, onda smo prešli dalje.
                    // Ovo je važno da se gumbi za pacijenta ne prikazuju ako je proces već prošao taj dio.
                    // No, u ovom slučaju, ako token dođe do event gatewaya i nema taskova, tada trebamo čekati pacijenta.
                    // Zato je bolja opcija detekcije u else if bloku ispod.
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
                // Ako nema aktivnih user taskova, ali je procesna instanca aktivna
                // (tj. nismo u End Eventu), onda je vrlo vjerojatno da čekamo na Event-Based Gatewayu
                // ili nekom Service Tasku. Za potrebe demoa, pretpostavit ćemo da je to Event-Based Gateway.
                // Ovo je pojednostavljenje i idealno bi se trebalo potvrditi provjerom aktivnih aktivnosti
                // putem Camunda REST API-ja (npr. GET /process-instance/{id}/activity-instances)
                // Ali za sada, ako nema user taska, ali je proces instance aktivan, mi 'čekamo' pacijenta
                // (ako je manual task 'Pošalji ponudu pacijentu' bio dovršen).
                
                // Ključno: provjeri je li procesna instanca još aktivna!
                // Ovdje NE MOŽEMO znati samo na temelju getUserTasks().
                // Za demo, ako 'Pošalji ponudu pacijentu' je bio zadnji user task, pretpostavljamo da čekamo.
                // Idealno bi se ovdje trebalo provjeriti aktivnost procesa.
                
                // Privremeno rješenje: ako je patientEmail postavljen, a nema aktivnih user taskova,
                // pretpostavi da čekamo pacijentov odgovor.
                // Ovo nije robustno, ali za demo će raditi ako se tok slijedi.
                if (patientEmail) { // Ako znamo tko je pacijent, i nema aktivnog taska, čekamo ga.
                    setWaitingForPatientResponse(true);
                } else {
                    setWaitingForPatientResponse(false); // Nema taskova, i ne znamo za koga čekati.
                }

                console.log("Nema aktivnih zadataka za prikaz.");
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
    }, [processInstanceId, patientEmail]); // Dodan patientEmail u dependency array

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
        // Ako je dovršen "Pošalji ponudu pacijentu" task
        if (task.name === 'Pošalji ponudu pacijentu') {
            // Nema specifičnih varijabli za slanje, samo dovršavamo task
            // Ključno: POSTAVI `waitingForPatientResponse` na true
            setWaitingForPatientResponse(true); 
            // setTask(null); // Ne resetiraj task odmah, neka fetchTask interval to obradi
        } else {
            setTask(null); // Resetiraj task nakon dovršetka, da se ponovno fetchaju
        }

        try {
            await camundaController.completeUserTask(task.id, variablesToComplete);
            alert(`Zadatak '${task.name}' uspješno dovršen!`);
            // Fetchaj ponovo odmah da se UI ažurira
            fetchTask(); 
        } catch (err: any) {
            console.error('Greška pri dovršetku zadatka:', err);
            alert(`Greška pri dovršetku zadatka: ${err.message}`);
        }
    };

    // Funkcija za rukovanje pacijentovom potvrdom/odbijanjem
    const handlePatientResponse = async (isConfirmed: boolean) => {
        // Koristimo patientEmail iz state-a koji je postavljen kada je task Pošalji ponudu pacijentu bio aktivan
        const currentPatientEmail = patientEmail; 

        if (!currentPatientEmail) {
            alert('Nije moguće simulirati potvrdu: nedostaje pacijentov email. Molimo pokrenite novi proces.');
            return;
        }

        try {
            await camundaController.confirmPatientAppointment(currentPatientEmail, isConfirmed);
            alert(`Pacijent je ${isConfirmed ? 'potvrdio' : 'odbio'} termin.`);
            setWaitingForPatientResponse(false); // Nema više čekanja na odgovor nakon slanja poruke
            // Fetchaj ponovo odmah da se UI ažurira
            fetchTask(); 
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

    if (!task && initialFetchDone && !waitingForPatientResponse) { // Dodana provjera `!waitingForPatientResponse`
        return <div style={{ textAlign: 'center', padding: '20px' }}>
            Nema aktivnih korisničkih zadataka za ovu instancu procesa. Proces je možda završen ili je na Service Tasku.
        </div>;
    }

    // Prikazati loading state kada se task promijenio (npr. nakon dovršetka)
    if (!task && loading && initialFetchDone) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Ažuriranje statusa procesa...</div>;
    }


    return (
        <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
            <h2>User Task: {task?.name || 'Nema aktivnog taska'}</h2> {/* Prikazati "Nema aktivnog taska" ako task=null */}
            <p>Process Instance ID: {processInstanceId}</p>

            {task?.name === 'Odaberi jedan od dostupnih termina' && (
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

            {/* LOGIKA ZA MANUAL TASK "Pošalji ponudu pacijentu" ILI ČEKANJE NA ODGOVOR PACIJENTA */}
            {(task?.name === 'Pošalji ponudu pacijentu' || waitingForPatientResponse) && (
                <div>
                    <p>Pacijent: **{patientEmail || 'N/A'}**</p> {/* Koristi patientEmail iz state-a */}
                    {task?.name === 'Pošalji ponudu pacijentu' && (
                        <>
                            <p>Potvrđeni termin: **{task.variables?.selectedAppointment || 'N/A'}**</p>
                            <p>Administrator treba poslati ponudu pacijentu. **(Kliknite ispod kad je ponuda poslana.)**</p>
                            <button
                                onClick={handleCompleteTask}
                                style={{
                                    backgroundColor: '#007bff',
                                    color: 'white',
                                    padding: '10px 15px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    marginBottom: '15px'
                                }}
                            >
                                Dovrši 'Pošalji ponudu pacijentu' (Admin akcija u Camundi)
                            </button>
                        </>
                    )}

                    {/* Ovi gumbi se prikazuju ako je "Pošalji ponudu pacijentu" aktivan ILI ako čekamo na odgovor pacijenta */}
                    {waitingForPatientResponse && ( // Prikazuj gumbe samo ako čekamo odgovor
                        <>
                            <p style={{ fontWeight: 'bold', color: 'green', marginTop: '20px' }}>
                                Ponuda je poslana. Sada simulirajte pacijentov odgovor:
                            </p>
                            <button
                                onClick={() => handlePatientResponse(true)}
                                style={{
                                    backgroundColor: '#28a745',
                                    color: 'white',
                                    padding: '10px 15px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px',
                                    marginRight: '10px'
                                }}
                            >
                                Simuliraj Pacijentovu Potvrdu
                            </button>
                            <button
                                onClick={() => handlePatientResponse(false)}
                                style={{
                                    backgroundColor: '#dc3545',
                                    color: 'white',
                                    padding: '10px 15px',
                                    border: 'none',
                                    borderRadius: '5px',
                                    cursor: 'pointer',
                                    fontSize: '16px'
                                }}
                            >
                                Simuliraj Pacijentovo Odbijanje
                            </button>
                        </>
                    )}
                     {/* Prikazati poruku da se čeka ako su gumbi za slanje admin taska nestali, ali gumbi za pacijenta nisu još kliknuti */}
                    {!task && waitingForPatientResponse && (
                        <p style={{ color: 'blue', marginTop: '20px' }}>
                            Čeka se pacijentova potvrda/odbijanje... (Imate 30 sekundi od slanja ponude).
                        </p>
                    )}
                </div>
            )}

            {task?.name === 'Ponovno predloži termin' && (
                <div>
                    <p style={{ color: 'orange', fontWeight: 'bold' }}>Pacijent je odbio termin. Molimo odaberite novi termin.</p>
                    <p>Pacijent: **{task.variables?.patientName || 'N/A'}** ({task.variables?.patientEmail || 'N/A'})</p>
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
                        Dovrši 'Ponovno predloži termin'
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserTaskForm;