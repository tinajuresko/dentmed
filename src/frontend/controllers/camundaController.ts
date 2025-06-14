// src/controllers/camundaController.ts
import axios from 'axios';
import { camundaRoutes } from '../api/routes/camundaRoutes'; // Ovo će ti trebati

interface StartProcessResponse {
    message: string;
    processInstanceId: string;
}

interface UserTask {
    id: string;
    name: string;
    processInstanceId: string;
    // Frontend će primiti varijable već mapirane i parsed (npr. availableAppointments kao List<string>)
    variables: { [key: string]: any };
}

const API_BASE_URL = "http://localhost:5216"; // URL.NET BACKENDA
// const CAMUNDA_API_BASE_URL = "http://localhost:8080/engine-rest"; // OVO VIŠE NE TREBA AKO SVE IDE PREKO .NET BACKENDA

export const camundaController = {
    // ide preko .NET backenda
    startAppointmentProcess: async (patientName: string, patientEmail: string): Promise<StartProcessResponse | null> => {
        try {
            const response = await axios.post<StartProcessResponse>(
                camundaRoutes.startAppointmentProcess(), // Poziva .NET endpoint /api/camunda/startAppointmentProcess
                { patientName, patientEmail }
            );
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Error starting Camunda process:', error.response?.data || error.message);
                throw new Error(error.response?.data?.message || 'Greška pri pokretanju Camunda procesa.');
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Došlo je do neočekivane greške.');
            }
        }
    },

    async getUserTasks(processInstanceId: string): Promise<UserTask[]> {
        try {
            const response = await axios.get<UserTask[]>(
                camundaRoutes.getUserTasks(processInstanceId) // Poziva .NET endpoint /api/camunda/user-tasks/{processInstanceId}
            );
            const data = response.data;

            console.log("Dohvaćeni User Taskovi (preko .NET backenda):", data);
            return data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Greška pri dohvatu korisničkih zadataka (preko .NET backenda):', error.response?.data || error.message);
                throw new Error(error.response?.data?.message || 'Greška pri dohvatu zadatka.');
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Došlo je do neočekivane greške.');
            }
        }
    },

    async completeUserTask(taskId: string, variables: { [key: string]: any }): Promise<boolean> {
        try {
            const payload = {
                variables: variables // Varijable koje se šalju .NET backendu
            };

            const response = await axios.post(
                camundaRoutes.completeUserTask(taskId), // Poziva .NET endpoint /api/camunda/complete-user-task/{taskId}
                payload
            );

            console.log(`Task ${taskId} uspješno dovršen.`);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Greška pri dovršetku korisničkog zadatka (preko .NET backenda):', error.response?.data || error.message);
                throw new Error(error.response?.data?.message || `Greška pri dovršetku zadatka ${taskId}.`);
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Došlo je do neočekivane greške.');
            }
        }
    },

    // Metoda za simulaciju potvrde pacijenta
    async confirmPatientAppointment(patientEmail: string, isConfirmed: boolean): Promise<boolean> {
        try {
            const payload = {
                patientEmail,
                isConfirmed
            };

            const response = await axios.post(
                camundaRoutes.confirmAppointment(), // Poziva .NET endpoint /api/camunda/confirm-appointment
                payload
            );

            console.log(`Pacijentova ${isConfirmed ? 'potvrda' : 'odbijenica'} poslana za ${patientEmail}.`);
            return true;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                console.error('Greška pri slanju pacijentove potvrde:', error.response?.data || error.message);
                throw new Error(error.response?.data?.message || 'Greška pri slanju potvrde pacijenta.');
            } else {
                console.error('Unexpected error:', error);
                throw new Error('Došlo je do neočekivane greške.');
            }
        }
    },

    isProcessInstanceEnded: async (processInstanceId: string): Promise<boolean> => {
        try {
            // Axios response objekt ima property `data` za sadržaj, `status` za status kod, `statusText` itd.
            const response = await axios.get<boolean>(
                camundaRoutes.isProcessInstanceActive(processInstanceId) // Poziva .NET endpoint
            );

            if (response.status === 200) {
                // C# endpoint vraća true ako je PROCES AKTIVAN, false ako je ZAVRŠIO/nije pronađen.
                const isActive = response.data; // Ovo će biti true ili false

                // Ako je isActive false, onda je proces završio.
                return !isActive;
            } else {
                // Ako status nije 200 OK, smatramo to greškom ili da proces nije završio
                console.error(`Unexpected HTTP status for process instance check: ${response.status}`);
                throw new Error(`Unexpected HTTP status: ${response.status}`);
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    console.error('Error checking if process instance is ended via C# proxy:', error.response.status, error.response.data);
                    
                    return false; // Ako dođe do greške, pretpostavljamo da proces NIJE završio.
                } else {
                    console.error('Network or unknown error checking process instance status:', error.message);
                    return false; // Mrežna greška
                }
            } else {
                console.error('Unexpected error checking process instance status:', error);
                return false; // Neočekivana greška
            }
        }
    },

};