import axios from "axios";
import {
  lijecnikRoutes,
  zaposlenikRoutes,
} from "../api/routes/zaposlenikRoutes";
import { Zaposlenik } from "../models/Zaposlenik";

export const zaposlenikController = {
  //lijecnici
  getAllDoc: async (): Promise<Zaposlenik[]> => {
    const response = await axios.get<Zaposlenik[]>(lijecnikRoutes.getAll());
    return response.data;
  },

  //svi zaposlenici
  getAll: async (): Promise<Zaposlenik[]> => {
    const response = await axios.get<Zaposlenik[]>(zaposlenikRoutes.getAll());
    return response.data;
  },

  //promjena smjene
  update: async (id, newData): Promise<Zaposlenik[]> => {
    const response = await axios.put<Zaposlenik[]>(
      zaposlenikRoutes.update(id),
      newData
    );
    return response.data;
  },
};
