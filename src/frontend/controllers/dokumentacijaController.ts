import axios from "axios";

import { pacijentRoutes } from "../api/routes/pacijentRoutes";
import { Pacijent } from "../models/pacijent";
import { Dokumentacija } from "../models/dokumentacija";
import { dokumentacijaRoutes } from "../api/routes/dokumentacijaRoutes";

export const dokumentacijaController = {
  //svi pacijenti
  getAll: async (id): Promise<Dokumentacija[]> => {
    const response = await axios.get<Dokumentacija[]>(
      dokumentacijaRoutes.getByPacijentId(id)
    );
    return response.data;
  },

  //promjena smjene
  create: async (newData): Promise<Dokumentacija[]> => {
    const response = await axios.post<Dokumentacija[]>(
      dokumentacijaRoutes.add(),
      newData
    );
    return response.data;
  },
};
