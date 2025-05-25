import { DENTMED_API_HOST } from "../apiConfig";

export const zaposlenikRoutes = {
  // Dohvati sve zaposlenike
  getAll: () => `${DENTMED_API_HOST}/zaposlenik`,
  update: (id: number) => `${DENTMED_API_HOST}/zaposlenik/${id}`,
};

export const lijecnikRoutes = {
  // Dohvati sve lijecnike
  getAll: () => `${DENTMED_API_HOST}/zaposlenik/lijecnik`,
  getAllFree: (pocetak: string, trajanje: number) =>
    `${DENTMED_API_HOST}/zaposlenik/lijecnik/${pocetak}/${trajanje}`,
};
