import { DENTMED_API_HOST } from "../apiConfig";

export const terminRoutes = {
  // Dohvati sve termine
  getAll: () => `${DENTMED_API_HOST}/termin`,

  // Dodaj novi termin
  add: (trajanje) => `${DENTMED_API_HOST}/termin/${trajanje}`,

  // Ažuriraj termin po ID-u
  update: (id_termin: number | string) =>
    `${DENTMED_API_HOST}/termin/${id_termin}`,

  // Izbriši termin po ID-u
  delete: (id_termin: number | string) =>
    `${DENTMED_API_HOST}/termin/${id_termin}`,

  // Dohvati slobodne termine za zadani datum, smjenu i trajanje
  getFreeBySmjenaAndDateAndDuration: (
    id_smjena: number | string,
    datum: string, // očekuje se string u ISO formatu, npr. "2025-05-23"
    trajanje: number
  ) =>
    `${DENTMED_API_HOST}/termin/slobodni/smjena/${id_smjena}/datum/${datum}/${trajanje}`,

  // Dohvati zauzete termine za zadani datum i smjenu
  getBusyBySmjenaAndDate: (
    id_smjena: number | string,
    datum: string,
    trajanje: number
  ) =>
    `${DENTMED_API_HOST}/termin/zauzeti/smjena/${id_smjena}/datum/${datum}/${trajanje}`,
};
