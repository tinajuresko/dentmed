import axios from "axios";
import { Dokumentacija } from "../models/Dokumentacija";
import { dokumentacijaRoutes } from "../api/routes/dokumentacijaRoutes";

export const dokumentacijaController = {
  //svi pacijenti
  getAll: async (id: number): Promise<Dokumentacija[]> => {
    try {
      const response = await axios.get<Dokumentacija[]>(
        dokumentacijaRoutes.getByPacijentId(id)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllDokumentacija:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  //promjena smjene
  create: async (newData): Promise<Dokumentacija[]> => {
    try {
      const response = await axios.post<Dokumentacija[]>(
        dokumentacijaRoutes.add(),
        newData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with postDokumentacija:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },
};
