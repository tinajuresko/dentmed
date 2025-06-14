import { DENTMED_API_HOST } from "../apiConfig";
const CAMUNDA_BASE_URL = 'camunda'; 

export const camundaRoutes = {
  startAppointmentProcess: () => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/startAppointmentProcess`, 
  getUserTasks: (processInstanceId: string) => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/user-tasks/${processInstanceId}`, 
  completeUserTask: (taskId: string) => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/complete-user-task/${taskId}`, 
  confirmAppointment: () => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/confirm-appointment`,
  isProcessInstanceActive: (processInstanceId: string) => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/process-instance-active/${processInstanceId}`,
};