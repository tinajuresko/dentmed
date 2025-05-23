import { DENTMED_API_HOST } from "../apiConfig";

export const dokumentacijaRoutes = {
  // Dohvati dokumentaciju za pacijenta po id-ju
  getByPacijentId: (id_pacijent: number | string) =>
    `${DENTMED_API_HOST}/dokumentacija/pacijent/${id_pacijent}`,

  // Dodaj novu dokumentaciju
  add: () => `${DENTMED_API_HOST}/dokumentacija`,
};
