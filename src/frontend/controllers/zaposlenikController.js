import { createZaposlenik } from "../models/zaposlenik";

let mockZaposlenici = [
  { id_zaposlenik: 1, ime: "Ana", prezime: "Anić", id_radno_vrijeme: 1 },
  { id_zaposlenik: 2, ime: "Marko", prezime: "Marić", id_radno_vrijeme: 2 },
];

export const zaposlenikController = {
  getAll: () => {
    return Promise.resolve(mockZaposlenici.map(createZaposlenik));
  },

  update: (zaposlenik) => {
    return new Promise((resolve, reject) => {
      const index = mockZaposlenici.findIndex(z => z.id_zaposlenik === zaposlenik.id_zaposlenik);
      if (index === -1) return reject("Zaposlenik nije pronađen.");
      mockZaposlenici[index] = { ...zaposlenik };
      resolve(createZaposlenik(mockZaposlenici[index]));
    });
  }
};
