import axios from "axios";
import {
  lijecnikRoutes,
  zaposlenikRoutes,
} from "../api/routes/zaposlenikRoutes";
import { Zaposlenik } from "../models/Zaposlenik";

export const zaposlenikController = {
  //lijecnici
  getAllDoc: async (): Promise<Zaposlenik[]> => {
    try {
      const response = await axios.get<Zaposlenik[]>(lijecnikRoutes.getAll());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllDoc:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  //slobodni lijecnici
  getAllFreeDoc: async (
    pocetak: string,
    trajanje: number
  ): Promise<Zaposlenik[]> => {
    try {
      const response = await axios.get<Zaposlenik[]>(
        lijecnikRoutes.getAllFree(pocetak, trajanje)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllFreeDoc:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  //svi zaposlenici
  getAll: async (): Promise<Zaposlenik[]> => {
    try {
      const response = await axios.get<Zaposlenik[]>(zaposlenikRoutes.getAll());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllZaposlenik:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  //promjena smjene
  update: async (id: number, newData: Zaposlenik): Promise<Zaposlenik[]> => {
    try {
      const response = await axios.put<Zaposlenik[]>(
        zaposlenikRoutes.update(id),
        newData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with updateZaposlenik:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },
};
