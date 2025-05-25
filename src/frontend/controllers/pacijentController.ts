import axios from "axios";
import { pacijentRoutes } from "../api/routes/pacijentRoutes";
import { Pacijent } from "../models/Pacijent";

export const pacijentController = {
  //svi pacijenti
  getAll: async (): Promise<Pacijent[]> => {
    try {
      const response = await axios.get<Pacijent[]>(pacijentRoutes.getAll());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllPacijent:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  getAllFree: async (date: string, trajanje: number): Promise<Pacijent[]> => {
    try {
      const response = await axios.get<Pacijent[]>(
        pacijentRoutes.getAllFree(date, trajanje)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllFreePacijent:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  //promjena smjene
  create: async (newData): Promise<Pacijent[]> => {
    try {
      const response = await axios.post<Pacijent[]>(
        pacijentRoutes.add(),
        newData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with postPacijent:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  delete: async (id: number): Promise<void | Pacijent> => {
    try {
      const response = await axios.delete<Pacijent>(pacijentRoutes.delete(id));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with deletePacijent:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return;
  },

  search: async (query: string): Promise<void | Pacijent> => {
    try {
      const response = await axios.get<Pacijent>(pacijentRoutes.search(query));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with searchPacijent:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return;
  },
};
