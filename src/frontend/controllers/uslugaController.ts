import axios from "axios";
import { Usluga } from "../models/Usluga";
import { uslugaRoutes } from "../api/routes/uslugaRoutes";

export const uslugaController = {
  getAll: async (): Promise<Usluga[]> => {
    try {
      const response = await axios.get<Usluga[]>(uslugaRoutes.getAll());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllUsluga:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },
};
