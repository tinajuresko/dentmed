import { createOprema } from "../models/resurs.js";
import { resursController } from "./resursController.js";

let mockOprema = [
  { id_oprema: 1, proizvodac: "Sony", kontakt: "kontakt@sony.com" },
  { id_oprema: 3, proizvodac: "Dell", kontakt: "kontakt@dell.com" },
];

export const opremaController = {
  getAll: () =>
    new Promise(async (resolve) => {
      setTimeout(async () => {
        const sviResursi = await resursController.getAll();

        // spoji resurs i opremu preko id
        const oprema = mockOprema.map((o) => {
          const resurs = sviResursi.find((r) => r.id_resurs === o.id_oprema);
          return { ...resurs, ...o };
        });
        resolve(oprema.map(createOprema));
      }, 300);
    }),

  create: async (newOprema) => {
    // prvo kreiraj resurs
    const noviResurs = await resursController.create({
      naziv: newOprema.naziv || "Nova oprema",
      dostupnost: newOprema.dostupnost || 1,
      id_admin: newOprema.id_admin || 10,
    });

    const opremaSaId = { ...newOprema, id_oprema: noviResurs.id_resurs };
    mockOprema.push(opremaSaId);

    return createOprema({ ...noviResurs, ...opremaSaId });
  },

  update: async (updatedOprema) => {
    // update resursa
    await resursController.update({
      id_resurs: updatedOprema.id_oprema,
      naziv: updatedOprema.naziv,
      dostupnost: updatedOprema.dostupnost,
      id_admin: updatedOprema.id_admin,
    });

    const index = mockOprema.findIndex((o) => o.id_oprema === updatedOprema.id_oprema);
    if (index === -1) throw new Error("Oprema nije pronađena");

    mockOprema[index] = { ...updatedOprema };
    return createOprema({ ...updatedOprema });
  },

  delete: async (id) => {
    mockOprema = mockOprema.filter((o) => o.id_oprema !== id);
    await resursController.delete(id);
  },

  getAllSync: () => {
    if (typeof mockResursi === "undefined") {
      throw new Error("mockResursi nije definiran za getAllSync");
    }

    return mockOprema.map((o) => {
      const resurs = mockResursi.find((r) => r.id_resurs === o.id_oprema);
      return { ...resurs, ...o };
    });
  },
};
