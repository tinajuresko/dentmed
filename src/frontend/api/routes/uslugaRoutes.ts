import { DENTMED_API_HOST } from "../apiConfig";

export const uslugaRoutes = {
  // Dohvati sve usluge
  getAll: () => `${DENTMED_API_HOST}/usluga`,
};
