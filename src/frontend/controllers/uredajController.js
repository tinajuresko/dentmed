import { createUredaj } from "../models/resurs.js";

let mockUredaji = [
  { id_uredaj: 1, proizvodac: "HP", kontakt: "hp@kontakt.com", garancija_god: 2 },
  { id_uredaj: 2, proizvodac: "Dell", kontakt: "dell@kontakt.com", garancija_god: 3 },
];

export const uredajController = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const uredaji = mockUredaji.map((u) => createUredaj(u));
        resolve(uredaji);
      }, 500);
    });
  },

  create: (newUredaj) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const maxId = mockUredaji.reduce(
          (max, u) => (u.id_uredaj > max ? u.id_uredaj : max),
          0
        );
        const uredajSaId = { ...newUredaj, id_uredaj: maxId + 1 };
        mockUredaji.push(uredajSaId);
        resolve(createUredaj(uredajSaId));
      }, 300);
    });
  },

  update: (updatedUredaj) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockUredaji.findIndex(
          (u) => u.id_uredaj === updatedUredaj.id_uredaj
        );
        if (index === -1) {
          reject("Uređaj nije pronađen");
          return;
        }
        mockUredaji[index] = { ...updatedUredaj };
        resolve(createUredaj(mockUredaji[index]));
      }, 300);
    });
  },

  delete: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockUredaji = mockUredaji.filter((u) => u.id_uredaj !== id);
        resolve();
      }, 300);
    });
  },
};
