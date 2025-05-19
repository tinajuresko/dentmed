import { createProstor } from "../models/resurs.js";
import { resursController } from "./resursController.js";

let mockProstor = [
  { id_prostor: 2, dimenzija: "50m2" },
];

export const prostorController = {
  getAll: () =>
    new Promise(async (resolve) => {
      setTimeout(async () => {
        // Asinkrono dohvaća sve resurse
        const sviResursi = await resursController.getAll();

        const prostori = mockProstor.map((p) => {
          const resurs = sviResursi.find((r) => r.id_resurs === p.id_prostor);
          return { ...resurs, ...p };
        });
        resolve(prostori.map(createProstor));
      }, 300);
    }),

  create: async (newProstor) => {
    const noviResurs = await resursController.create({
      naziv: newProstor.naziv || "Novi prostor",
      dostupnost: newProstor.dostupnost || 1,
      id_admin: newProstor.id_admin || 10,
    });

    const prostorSaId = { ...newProstor, id_prostor: noviResurs.id_resurs };
    mockProstor.push(prostorSaId);

    return createProstor({ ...noviResurs, ...prostorSaId });
  },

  update: async (updatedProstor) => {
    await resursController.update({
      id_resurs: updatedProstor.id_prostor,
      naziv: updatedProstor.naziv,
      dostupnost: updatedProstor.dostupnost,
      id_admin: updatedProstor.id_admin,
    });

    const index = mockProstor.findIndex((p) => p.id_prostor === updatedProstor.id_prostor);
    if (index === -1) throw new Error("Prostor nije pronađen");

    mockProstor[index] = { ...updatedProstor };
    return createProstor({ ...updatedProstor });
  },

  delete: async (id) => {
    mockProstor = mockProstor.filter((p) => p.id_prostor !== id);
    await resursController.delete(id);
  },

  getAllSync: () => {
    if (typeof mockResursi === "undefined") {
      throw new Error("mockResursi nije definiran za getAllSync");
    }
    return mockProstor.map((p) => {
      const resurs = mockResursi.find((r) => r.id_resurs === p.id_prostor);
      return { ...resurs, ...p };
    });
  },
};
