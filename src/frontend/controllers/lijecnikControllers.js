import { createLijecnik } from "../models/lijecnik.js";

let mockLijecnici = [
  { id_lijecnik: 10, ime: "Ana", prezime: "Anić" },
  { id_lijecnik: 11, ime: "Ivan", prezime: "Ivić" },
  { id_lijecnik: 12, ime: "Marija", prezime: "Marić" },
];

export const lijecnikController = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockLijecnici.map((l) => createLijecnik(l)));
      }, 300);
    });
  },
};
