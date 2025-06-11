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
    // Ovdje je ključna promjena: 'Variables' je sada direktno Dictionary<string, object>
    // Frontend će primiti varijable već mapirane i parsed (npr. availableAppointments kao List<string>)
    variables: { [key: string]: any };
}

const API_BASE_URL = "http://localhost:5216"; // URL TVOJ.NET BACKENDA
// const CAMUNDA_API_BASE_URL = "http://localhost:8080/engine-rest"; // OVO VIŠE NE TREBA AKO SVE IDE PREKO .NET BACKENDA

export const camundaController = {
    // Ova metoda je već bila ok jer je išla preko .NET backenda
    startAppointmentProcess: async (patientName: string, patientEmail: string): Promise<StartProcessResponse | null> => {
        try {
            const response = await axios.post<StartProcessResponse>(
                camundaRoutes.startAppointmentProcess(), // Poziva tvoj .NET endpoint /api/camunda/startAppointmentProcess
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
            // SADA POZIVAMO TVOJ .NET BACKEND, ENDPOINT KOJI SI UPRAVO POSLAO
            const response = await axios.get<UserTask[]>(
                camundaRoutes.getUserTasks(processInstanceId) // Poziva tvoj .NET endpoint /api/camunda/user-tasks/{processInstanceId}
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

            // SADA POZIVAMO TVOJ .NET BACKEND, ENDPOINT KOJI SI UPRAVO POSLAO
            const response = await axios.post(
                camundaRoutes.completeUserTask(taskId), // Poziva tvoj .NET endpoint /api/camunda/complete-user-task/{taskId}
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
    }
};