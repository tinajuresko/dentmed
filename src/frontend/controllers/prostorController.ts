import axios from "axios";
import { prostorRoutes } from "../api/routes/prostorRoutes";
import { ProstorResponse } from "../api/responses/prostorResponse";
import { Prostor } from "../models/Prostor";

export const prostorController = {
  getAll: async (): Promise<Prostor[]> => {
    const response = await axios.get<Prostor[]>(prostorRoutes.getAll());
    return response.data;
  },
};
