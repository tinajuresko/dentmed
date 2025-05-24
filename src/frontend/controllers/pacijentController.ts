import axios from "axios";

import { pacijentRoutes } from "../api/routes/pacijentRoutes";
import { Pacijent } from "../models/pacijent";

export const pacijentController = {
  //svi pacijenti
  getAll: async (): Promise<Pacijent[]> => {
    const response = await axios.get<Pacijent[]>(pacijentRoutes.getAll());
    return response.data;
  },

  //promjena smjene
  create: async (newData): Promise<Pacijent[]> => {
    const response = await axios.post<Pacijent[]>(
      pacijentRoutes.add(),
      newData
    );
    return response.data;
  },

  delete: async (id): Promise<Pacijent> => {
    const response = await axios.delete<Pacijent>(pacijentRoutes.delete(id));
    return response.data;
  },

  search: async (query): Promise<Pacijent> => {
    const response = await axios.get<Pacijent>(pacijentRoutes.search(query));
    return response.data;
  },
};
