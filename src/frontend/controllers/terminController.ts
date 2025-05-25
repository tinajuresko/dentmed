import axios from "axios";
import { Termin } from "../models/Termin";
import { terminRoutes } from "../api/routes/terminRoutes";

export const terminController = {
  getAllFree: async (
    smjena: number | string,
    datum: string,
    trajanje: number
  ): Promise<Termin[]> => {
    try {
      const response = await axios.get<Termin[]>(
        terminRoutes.getFreeBySmjenaAndDateAndDuration(smjena, datum, trajanje)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllFreeTermin:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  getAllBusy: async (
    smjena: number | string,
    datum: string,
    trajanje: number
  ): Promise<Termin[]> => {
    try {
      const response = await axios.get<Termin[]>(
        terminRoutes.getBusyBySmjenaAndDate(smjena, datum, trajanje)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllBusyTermin:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  create: async (trajanje: number, newData): Promise<void | Termin> => {
    try {
      const response = await axios.post<Termin>(
        terminRoutes.add(trajanje),
        newData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with postTermin:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return;
  },

  delete: async (id: number): Promise<void | Termin> => {
    try {
      const response = await axios.delete<Termin>(terminRoutes.delete(id));
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with deleteTermin:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return;
  },

  update: async (id_termin: number, newData): Promise<void | Termin> => {
    try {
      const response = await axios.put<Termin>(
        terminRoutes.update(id_termin),
        newData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with updateTermin:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return;
  },
};
