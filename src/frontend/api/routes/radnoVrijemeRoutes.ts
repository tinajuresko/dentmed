import { DENTMED_API_HOST } from "../apiConfig";

export const radnoVrijemeRoutes = {
  // Dohvati sve definirane smjene
  getAll: () => `${DENTMED_API_HOST}/smjena`,

  // Dodaj novu smjenu
  add: () => `${DENTMED_API_HOST}/smjena`,

  // Izbriši smjenu po ID-u
  delete: (id_smjena: number | string) =>
    `${DENTMED_API_HOST}/smjena/${id_smjena}`,

  // Ažuriraj postojeću smjenu
  update: (id_smjena: number | string) =>
    `${DENTMED_API_HOST}/smjena/${id_smjena}`,
};