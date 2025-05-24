import axios from "axios";
import { uredajRoutes } from "../api/routes/uredajRoutes";
import { UredajResponse } from "../api/responses/UredajResponse";
import { Uredaj } from "../models/Uredaj";

export const uredajController = {
  getAll: async (): Promise<Uredaj[]> => {
    const response = await axios.get<Uredaj[]>(uredajRoutes.getAll());
    return response.data;
  },
};
