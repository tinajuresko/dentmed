import { DENTMED_API_HOST } from "../apiConfig";

export const uredajRoutes = {
  // Dohvati sve uređaje
  getAll: () => `${DENTMED_API_HOST}/uredaj`,
};
