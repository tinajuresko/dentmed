// src/controllers/camundaController.ts
import axios from 'axios';
import { camundaRoutes } from '../api/routes/camundaRoutes';

interface StartProcessResponse {
  message: string;
  processInstanceId: string;
}

interface UserTask {
    id: string;
    name: string;
    processInstanceId: string;
    variables: { [key: string]: any }; // Objekt s varijablama taska
}

const API_BASE_URL = "http://localhost:5216"

export const camundaController = {
  startAppointmentProcess: async (patientName: string, patientEmail: string): Promise<StartProcessResponse | null> => {
    try {
      const response = await axios.post<StartProcessResponse>(
        camundaRoutes.startAppointmentProcess(),
        { patientName, patientEmail }
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error('Error starting Camunda process:', error.response?.data || error.message);
        // Opcionalno, možeš baciti grešku da je komponenta uhvati
        throw new Error(error.response?.data?.message || 'Greška pri pokretanju Camunda procesa.');
      } else {
        console.error('Unexpected error:', error);
        throw new Error('Došlo je do neočekivane greške.');
      }
    }
  },
  async getUserTasks(processInstanceId: string): Promise<UserTask[] | null> {
    try {
        // Pozivamo tvoj C# backend endpoint
        const response = await fetch(`${API_BASE_URL}/api/camunda/user-tasks/${processInstanceId}`);
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Greška pri dohvatu zadatka.');
        }
        const data: UserTask[] = await response.json();
        console.log("Dohvaćeni User Taskovi:", data); // Korisno za debugiranje
        return data;
    } catch (error: any) {
        console.error('Greška pri dohvatu korisničkih zadataka:', error);
        throw error; // Proslijedi grešku dalje za obradu u komponenti
    }
},
 // Nova metoda za dovršetak User Taska
 async completeUserTask(taskId: string, variables: { [key: string]: any }): Promise<boolean> {
    try {
        // Payload za dovršetak taska (Camunda REST API očekuje 'variables' direktno)
        const payload = {
            variables: variables // Varijable koje se spremaju u Camundi nakon dovršetka taska
        };

        // Pozivamo tvoj C# backend endpoint za dovršetak taska
        const response = await fetch(`${API_BASE_URL}/api/camunda/complete-user-task/${taskId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Greška pri dovršetku zadatka ${taskId}.`);
        }
        console.log(`Task ${taskId} uspješno dovršen.`);
        return true;
    } catch (error: any) {
        console.error('Greška pri dovršetku korisničkog zadatka:', error);
        throw error;
    }
}
  
};