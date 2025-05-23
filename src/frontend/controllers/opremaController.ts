import axios from "axios";
import { opremaRoutes } from "../api/routes/opremaRoutes";
import { OpremaResponse } from "../api/responses/OpremaResponse";
import { Oprema } from "../models/Oprema";

export const opremaController = {
  getAll: async (): Promise<Oprema[]> => {
    const response = await axios.get<OpremaResponse>(opremaRoutes.getAll());
    return response.data.dokumentacije;
  }
};
