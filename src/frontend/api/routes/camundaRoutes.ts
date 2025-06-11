// src/api/routes/camundaRoutes.ts
import { DENTMED_API_HOST } from "../apiConfig";
const CAMUNDA_BASE_URL = 'camunda'; 

/*export const camundaRoutes = {
  startAppointmentProcess: () => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/startAppointmentProcess`,
};*/
const CAMUNDA_BASE = "/api/camunda";

export const camundaRoutes = {
  startAppointmentProcess: () => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/startAppointmentProcess`, // OVO JE BILO OK
  getUserTasks: (processInstanceId: string) => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/user-tasks/${processInstanceId}`, // NOVO
  completeUserTask: (taskId: string) => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/complete-user-task/${taskId}`, // NOVO
};