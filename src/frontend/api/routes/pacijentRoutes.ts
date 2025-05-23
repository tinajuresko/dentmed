import { DENTMED_API_HOST } from "../apiConfig";

export const pacijentRoutes = {
    getAll: () => `${DENTMED_API_HOST}/pacijent`,
    getById: (id: number | string) => `${DENTMED_API_HOST}/pacijent/${id}`,
    add: () => `${DENTMED_API_HOST}/pacijent`,
    delete: (id: number | string) => `${DENTMED_API_HOST}/pacijent/${id}`,
    search: (query: string) => `${DENTMED_API_HOST}/pacijent/search?pretraga=${encodeURIComponent(query)}`,
};
  