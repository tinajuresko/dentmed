import axios from "axios";

import { Usluga } from "../models/Usluga";
import { uslugaRoutes } from "../api/routes/uslugaRoutes";

export const uslugaController = {
  getAll: async (): Promise<Usluga[]> => {
    const response = await axios.get<Usluga[]>(uslugaRoutes.getAll());
    return response.data;
  },
};
