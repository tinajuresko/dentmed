// src/api/routes/camundaRoutes.ts
import { DENTMED_API_HOST } from "../apiConfig";
const CAMUNDA_BASE_URL = 'camunda'; 

export const camundaRoutes = {
  startAppointmentProcess: () => `${DENTMED_API_HOST}/${CAMUNDA_BASE_URL}/startAppointmentProcess`,
};