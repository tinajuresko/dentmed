import axios from "axios";
import { opremaRoutes } from "../api/routes/opremaRoutes";
import { Oprema } from "../models/Oprema";

export const opremaController = {
  getAll: async (): Promise<Oprema[]> => {
    const response = await axios.get<Oprema[]>(opremaRoutes.getAll());
    return response.data;
  },
};
