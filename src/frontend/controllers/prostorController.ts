import axios from "axios";
import { prostorRoutes } from "../api/routes/prostorRoutes";
import { Prostor } from "../models/Prostor";

export const prostorController = {
  getAll: async (): Promise<Prostor[]> => {
    try {
      const response = await axios.get<Prostor[]>(prostorRoutes.getAll());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllProstor:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },
};
