// src/frontend/pages/AppointmentsPage.tsx

import React, { useState } from 'react';
import { camundaController } from '../controllers/camundaController';
import UserTaskForm from '../pages/UserTaskForm'
import AppointmentRequestForm from '../pages/AppointmentRequestForm'; 

const AppointmentsPage: React.FC = () => {
    // State za spremanje ID-a instance procesa nakon što se pokrene
    const [processInstanceId, setProcessInstanceId] = useState<string | null>(null);
    // State za praćenje je li proces završen (ili nema više aktivnih taskova)
    const [processFinished, setProcessFinished] = useState(false);

    // Callback funkcija koja se poziva iz AppointmentRequestForm (kada se proces pokrene)
    const handleProcessStarted = (id: string) => {
        setProcessInstanceId(id); // Zapamti ID instance procesa
        setProcessFinished(false); // Resetiraj status
    };

    // Callback funkcija koja se poziva iz UserTaskForm kada nema aktivnih taskova
    const handleNoTasksFound = () => {
        setProcessFinished(true);
        // Opcionalno: setProcessInstanceId(null); ako želiš da se automatski vrati na početnu formu
    };

    return (
        <div style={{
            fontFamily: 'Arial, sans-serif',
            maxWidth: '800px',
            margin: '20px auto',
            padding: '20px',
            border: '1px solid #eee',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
            <h1 style={{ textAlign: 'center', color: '#333' }}>Zakazivanje termina</h1>

            {/* Prikaži početnu formu ako proces još nije pokrenut ili je završen */}
            {!processInstanceId && !processFinished && (
                <AppointmentRequestForm onProcessStarted={handleProcessStarted} />
            )}

            {/* Prikaži UserTaskForm ako je proces pokrenut i nije završen */}
            {processInstanceId && !processFinished && (
                <>
                    <p style={{
                        textAlign: 'center',
                        marginTop: '20px',
                        fontSize: '1.1em',
                        color: '#555'
                    }}>
                        Proces pokrenut! Pratite zadatke za instancu: <strong>{processInstanceId}</strong>
                    </p>
                    <UserTaskForm
                        processInstanceId={processInstanceId}
                        onNoTasksFound={handleNoTasksFound}
                    />
                </>
            )}

            {/* Poruka kada je proces završen ili nema aktivnih taskova */}
            {processFinished && (
                <div style={{
                    textAlign: 'center',
                    marginTop: '30px',
                    padding: '20px',
                    backgroundColor: '#e9f7ef',
                    border: '1px solid #d4edda',
                    borderRadius: '5px',
                    color: '#155724'
                }}>
                    <p style={{ fontSize: '1.2em', fontWeight: 'bold' }}>Proces je trenutno završen ili nema aktivnih zadataka.</p>
                    <button
                        onClick={() => {
                            setProcessFinished(false);
                            setProcessInstanceId(null); // Omogući ponovno pokretanje
                        }}
                        style={{
                            marginTop: '15px',
                            backgroundColor: '#007bff',
                            color: 'white',
                            padding: '10px 20px',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '1em'
                        }}
                    >
                        Započni novi proces
                    </button>
                </div>
            )}
        </div>
    );
};

export default AppointmentsPage;