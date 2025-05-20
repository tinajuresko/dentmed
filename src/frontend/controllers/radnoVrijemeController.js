import { createRadnoVrijeme } from "../models/radnovrijeme.js";
let radnaVremena = [
  { id_smjena: 1, pocetak: "08:00", kraj: "16:00" },
  { id_smjena: 2, pocetak: "14:00", kraj: "22:00" },
];

export const radnoVrijemeController = {
  getAll: () => {
    return Promise.resolve(radnaVremena.map(createRadnoVrijeme));
  },

  create: (novo) => {
    return new Promise((resolve) => {
      const maxId = Math.max(...radnaVremena.map(s => s.id_smjena), 0);
      const novi = { ...novo, id_smjena: maxId + 1 };
      radnaVremena.push(novi);
      resolve(createRadnoVrijeme(novi));
    });
  },

  update: (smjena) => {
    return new Promise((resolve, reject) => {
      const index = radnaVremena.findIndex(s => s.id_smjena === smjena.id_smjena);
      if (index === -1) return reject("Smjena nije pronađena.");
      radnaVremena[index] = { ...smjena };
      resolve(createRadnoVrijeme(smjena));
    });
  },

  delete: (id) => {
    return new Promise((resolve) => {
      radnaVremena = radnaVremena.filter(s => s.id_smjena !== id);
      resolve();
    });
  },
};
