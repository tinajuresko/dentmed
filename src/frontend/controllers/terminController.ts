import { RadnoVrijeme } from "../models/radnovrijeme";
import axios from "axios";
import { radnoVrijemeRoutes } from "../api/routes/radnoVrijemeRoutes";
import { Termin } from "../models/termin";
import { terminRoutes } from "../api/routes/terminRoutes";

export const terminController = {
  getAllFree: async (smjena, datum, trajanje): Promise<Termin[]> => {
    const response = await axios.get<Termin[]>(
      terminRoutes.getFreeBySmjenaAndDateAndDuration(smjena, datum, trajanje)
    );
    return response.data;
  },

  getAllBusy: async (smjena, datum, trajanje): Promise<Termin[]> => {
    const response = await axios.get<Termin[]>(
      terminRoutes.getBusyBySmjenaAndDate(smjena, datum, trajanje)
    );
    return response.data;
  },

  create: async (trajanje, newData): Promise<Termin> => {
    const response = await axios.post<Termin>(
      terminRoutes.add(trajanje),
      newData
    );
    return response.data;
  },

  delete: async (id): Promise<Termin> => {
    const response = await axios.delete<Termin>(terminRoutes.delete(id));
    return response.data;
  },

  update: async (id_termin, newData): Promise<Termin> => {
    const response = await axios.put<Termin>(
      terminRoutes.update(id_termin),
      newData
    );
    return response.data;
  },
};
