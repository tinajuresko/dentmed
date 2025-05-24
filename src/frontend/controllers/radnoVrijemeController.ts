import { RadnoVrijeme } from "../models/radnovrijeme";
import axios from "axios";
import { radnoVrijemeRoutes } from "../api/routes/radnoVrijemeRoutes";

export const radnoVrijemeController = {
  getAll: async (): Promise<RadnoVrijeme[]> => {
    const response = await axios.get<RadnoVrijeme[]>(
      radnoVrijemeRoutes.getAll()
    );
    return response.data;
  },

  create: async (newData): Promise<RadnoVrijeme> => {
    const response = await axios.post<RadnoVrijeme>(
      radnoVrijemeRoutes.add(),
      newData
    );
    return response.data;
  },

  delete: async (id): Promise<RadnoVrijeme> => {
    const response = await axios.delete<RadnoVrijeme>(
      radnoVrijemeRoutes.delete(id)
    );
    return response.data;
  },
};
