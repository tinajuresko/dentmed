// src/components/AppointmentRequestForm.tsx
import React, { useState } from 'react';
import { camundaController } from '../controllers/camundaController'; // <--- UVEZI NOVI KONTROLER

const AppointmentRequestForm: React.FC = () => {
  const [patientName, setPatientName] = useState('');
  const [patientEmail, setPatientEmail] = useState('');

  const handleStartProcess = async () => {
    if (!patientName || !patientEmail) {
      alert('Molimo unesite ime i email pacijenta.');
      return;
    }

    try {
      // Koristi metodu iz camundaController-a
      const result = await camundaController.startAppointmentProcess(patientName, patientEmail);

      if (result) { // Provjeri je li rezultat null (ako je kontroler uhvatio grešku)
        alert(`Proces zakazivanja pokrenut! ID procesa: ${result.processInstanceId}`);
        setPatientName('');
        setPatientEmail('');
      }
    } catch (error: any) { // Hvatanje grešaka koje su "bačene" iz kontrolera
      console.error('Greška u komponenti:', error.message);
      alert(`Greška: ${error.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', borderRadius: '8px', maxWidth: '400px', margin: '20px auto' }}>
      <h2>Zahtjev za zakazivanje termina</h2>
      <div>
        <label htmlFor="patientName" style={{ display: 'block', marginBottom: '5px' }}>Ime pacijenta:</label>
        <input
          id="patientName"
          type="text"
          value={patientName}
          onChange={(e) => setPatientName(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
          placeholder="Unesite ime"
        />
      </div>
      <div>
        <label htmlFor="patientEmail" style={{ display: 'block', marginBottom: '5px' }}>Email pacijenta:</label>
        <input
          id="patientEmail"
          type="email"
          value={patientEmail}
          onChange={(e) => setPatientEmail(e.target.value)}
          style={{ width: '100%', padding: '8px', marginBottom: '15px', borderRadius: '4px', border: '1px solid #ddd' }}
          placeholder="Unesite email"
        />
      </div>
      <button
        onClick={handleStartProcess}
        style={{
          backgroundColor: '#007bff',
          color: 'white',
          padding: '10px 15px',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '16px'
        }}
      >
        Započni zakazivanje termina
      </button>
    </div>
  );
};

export default AppointmentRequestForm;