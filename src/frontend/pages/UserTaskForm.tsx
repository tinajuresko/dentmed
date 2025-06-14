import React, { useState, useEffect, useRef } from 'react';
import { camundaController } from '../controllers/camundaController';

interface UserTaskFormProps {
    processInstanceId: string;
}

const UserTaskForm: React.FC<UserTaskFormProps> = ({ processInstanceId  }) => {
    const [task, setTask] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedTermin, setSelectedTermin] = useState<string>('');
    const [availableTermini, setAvailableTermini] = useState<string[]>([]);
    const [initialFetchDone, setInitialFetchDone] = useState(false);
    const [waitingForPatientResponse, setWaitingForPatientResponse] = useState(false);
    const [patientEmail, setPatientEmail] = useState<string | null>(null);
    const [processEnded, setProcessEnded] = useState(false); // Za praćenje kraja procesne instance

    const intervalRef = useRef<NodeJS.Timeout | null>(null); // Referenca za interval

    const fetchTask = async () => {
        try {
            setLoading(true);
            setError(null);

            // 1. KORAK: PROVJERA JE LI CIJELA PROCESNA INSTANCA ZAVRŠENA
            const endedByCamunda = await camundaController.isProcessInstanceEnded(processInstanceId);
            if (endedByCamunda) {
                console.log(`Process Instance ${processInstanceId} je STVARNO završena.`);
                setProcessEnded(true); // Postavi state da je proces završen
                setTask(null); // Nema više aktivnih taskova
                setWaitingForPatientResponse(false); // Nema više čekanja
                return; // Prekini daljnje izvršavanje ako je proces završio
            } else {
                setProcessEnded(false); // Ako Camunda kaže da proces NIJE završio
            }

            // 2. KORAK: AKO PROCES NIJE ZAVRŠIO, DOHVATI AKTIVNE USER TASKOVE
            const tasks = await camundaController.getUserTasks(processInstanceId);

            if (tasks && tasks.length > 0) {
                const fetchedTask = tasks[0];
                setTask(fetchedTask);
                console.log("Dohvaćen task:", fetchedTask);

                // Ažuriraj patientEmail kada se task dohvati
                if (fetchedTask.variables?.patientEmail) {
                    setPatientEmail(fetchedTask.variables.patientEmail);
                }

                // Ako je trenutni task "Pošalji ponudu pacijentu", resetiraj waitingForPatientResponse na false
                // jer tek treba kliknuti gumb za dovršetak tog taska
                if (fetchedTask.name === 'Pošalji ponudu pacijentu') {
                    setWaitingForPatientResponse(false);
                } else {
                    // Za sve ostale aktivne user taskove, nismo u fazi čekanja na pacijentov odgovor.
                    setWaitingForPatientResponse(false);
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
                // Nema aktivnih user taskova I proces NIJE završio (zbog gornje provjere `endedByCamunda`)
                setTask(null);
                setAvailableTermini([]);

                // Ako nema user taskova, ali imamo patientEmail (što implicira da je "Pošalji ponudu pacijentu" završen),
                // onda smo u stanju čekanja na pacijentov odgovor (Message Catch Event).
                if (patientEmail && !endedByCamunda) { 
                    setWaitingForPatientResponse(true);
                } else {
                    setWaitingForPatientResponse(false);
                }

                console.log("Nema aktivnih zadataka za prikaz. (Proces možda čeka na poruku ili je u automatskoj fazi).");
            }
        } catch (err: any) {
            console.error('Greška pri dohvatu korisničkog zadatka ili provjeri statusa procesa:', err);
            setError(err.message || 'Greška pri dohvatu zadatka ili provjeri statusa procesa.');
            setProcessEnded(false); // U slučaju greške, ne možemo biti sigurni da je završio
            setWaitingForPatientResponse(false); // U slučaju greške, resetiraj
        } finally {
            setLoading(false);
            setInitialFetchDone(true);
        }
    };

    useEffect(() => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }

        fetchTask();
        // Postavi interval za ponovno dohvaćanje svakih 3 sekunde, ALI samo ako proces nije završio
        intervalRef.current = setInterval(() => {
            if (!processEnded) { // Provjeravaj samo ako proces NIJE završio
                fetchTask();
            } else {
                // Ako je proces završio, zaustavi interval
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
            }
        }, 3000);

        // Cleanup funkcija za useEffect
        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [processInstanceId, processEnded, patientEmail]); // Dodan processEnded i patientEmail u dependency array

    const handleCompleteTask = async () => {
        if (!task) {
            alert('Nema aktivnog zadatka za dovršetak.');
            return;
        }

        let variablesToComplete: { [key: string]: any } = {};

        if (task.name === 'Odaberi jedan od dostupnih termina' || task.name === 'Ponovno predloži termin') {
            if (!selectedTermin) {
                alert('Molimo odaberite termin.');
                return;
            }
            variablesToComplete = {
                selectedAppointment: { value: selectedTermin, type: 'String' }
            };
        }

        try {
            await camundaController.completeUserTask(task.id, variablesToComplete);
            alert(`Zadatak '${task.name}' uspješno dovršen!`);
            // Posebna logika nakon dovršetka "Pošalji ponudu pacijentu"
            if (task.name === 'Pošalji ponudu pacijentu') {
                // Nakon što admin dovrši ovaj task, proces ide na čekanje poruke (Patient Confirmation)
                // U ovom trenutku NEMA user taska, ali proces NIJE završen.
                // trebamo prikazati gumbe za simulaciju pacijentovog odgovora.
                setWaitingForPatientResponse(true);
            }
            fetchTask(); // Ponovno dohvati da se UI ažurira
        } catch (err: any) {
            console.error('Greška pri dovršetku zadatka:', err);
            alert(`Greška pri dovršetku zadatka: ${err.message}`);
        }
    };

    const handlePatientResponse = async (isConfirmed: boolean) => {
        const currentPatientEmail = patientEmail;

        if (!currentPatientEmail) {
            alert('Nije moguće simulirati potvrdu: nedostaje pacijentov email. Molimo pokrenite novi proces.');
            return;
        }

        try {
            // Ova funkcija mora poslati poruku Camundi 
            // kako bi se "uhvatila" poruka u Message Catch Eventu.
            await camundaController.confirmPatientAppointment(currentPatientEmail, isConfirmed);
            alert(`Pacijent je ${isConfirmed ? 'potvrdio' : 'odbio'} termin.`);
            setWaitingForPatientResponse(false); // Nema više čekanja na odgovor nakon slanja poruke
            fetchTask(); // Ponovno dohvati taskove da se ažurira UI
        } catch (err: any) {
            console.error('Greška pri slanju pacijentove potvrde:', err);
            alert(`Greška pri slanju pacijentove potvrde: ${err.message}`);
        }
    };

    // Glavni render uvjeti

    // 1. Prikazati loading state dok se ne izvrši prvi fetch
    if (loading && !initialFetchDone) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>Učitavanje zadataka...</div>;
    }

    // 2. Prikazati grešku ako je došlo do nje
    if (error) {
        return <div style={{ color: 'red', textAlign: 'center', padding: '20px' }}>Greška: {error}</div>;
    }

    // 3. Prikazati poruku ako je proces ZAVRŠIO (došao do End Eventa)
    if (processEnded) {
        return (
            <div style={{ textAlign: 'center', padding: '20px', color: 'green', fontWeight: 'bold' }}>
                Proces s ID-om "{processInstanceId}" je uspješno završen.
            </div>
        );
    }

    // 4. Prikazati gumbe za simulaciju ako čekamo odgovor pacijenta (nema aktivnog taska, ali proces traje)
    if (!task && waitingForPatientResponse) {
        return (
            <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '600px', margin: '20px auto' }}>
                <h2>Čeka se pacijentova potvrda</h2>
                <p>Process Instance ID: {processInstanceId}</p>
                <p>Pacijent: **{patientEmail || 'N/A'}**</p>
                <p style={{ fontWeight: 'bold', color: 'blue', marginTop: '20px' }}>
                    Čeka se pacijentova potvrda/odbijanje termina.
                </p>
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
            </div>
        );
    }

    // 5. Ako nema aktivnih taskova, nismo u waiting fazi, i proces NIJE završio (što znači da je na nekom automatskom koraku)
    if (!task && initialFetchDone) {
        return <div style={{ textAlign: 'center', padding: '20px' }}>
            Nema aktivnih korisničkih zadataka za ovu instancu procesa. Proces je u tijeku ili čeka.
        </div>;
    }

    // Ako imamo aktivni task, prikaži ga
    if (task) {
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

                {task.name === 'Pošalji ponudu pacijentu' && (
                    <div>
                        <p>Pacijent: **{patientEmail || 'N/A'}**</p>
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
                    </div>
                )}

                {task.name === 'Ponovno predloži termin' && (
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
    }
    
    // Fallback ako ništa od navedenog nije uhvaćeno, ali nije ni loading
    return null;
};

export default UserTaskForm;