import axios from "axios";
import { uredajRoutes } from "../api/routes/uredajRoutes";
import { Uredaj } from "../models/Uredaj";

export const uredajController = {
  getAll: async (): Promise<Uredaj[]> => {
    try {
      const response = await axios.get<Uredaj[]>(uredajRoutes.getAll());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllUredaj:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },
};
