import { RadnoVrijeme } from "../models/RadnoVrijeme";
import axios from "axios";
import { radnoVrijemeRoutes } from "../api/routes/radnoVrijemeRoutes";

export const radnoVrijemeController = {
  getAll: async (): Promise<RadnoVrijeme[]> => {
    try {
      const response = await axios.get<RadnoVrijeme[]>(
        radnoVrijemeRoutes.getAll()
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllRadnoVrijeme:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },

  create: async (newData): Promise<void | RadnoVrijeme> => {
    try {
      const response = await axios.post<RadnoVrijeme>(
        radnoVrijemeRoutes.add(),
        newData
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with postRadnoVrijeme:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return;
  },

  delete: async (id: number): Promise<void | RadnoVrijeme> => {
    try {
      const response = await axios.delete<RadnoVrijeme>(
        radnoVrijemeRoutes.delete(id)
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with deleteRadnoVrijeme:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return;
  },
};
