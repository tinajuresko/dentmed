import axios from "axios";
import { opremaRoutes } from "../api/routes/opremaRoutes";
import { Oprema } from "../models/Oprema";

export const opremaController = {
  getAll: async (): Promise<Oprema[]> => {
    try {
      const response = await axios.get<Oprema[]>(opremaRoutes.getAll());
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error with getAllOprema:" + error);
      } else {
        console.error("Unexpected error:", error);
      }
    }
    return [];
  },
};
