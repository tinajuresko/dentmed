import { createResurs } from "../models/resurs.js";

let mockResursi = [
  { id_resurs: 1, naziv: "Projektor", dostupnost: 1, id_admin: 10, datum_vrijeme: "2025-05-18T10:00:00" },
  { id_resurs: 2, naziv: "Sala A", dostupnost: 1, id_admin: 11, datum_vrijeme: "2025-05-18T10:05:00" },
  { id_resurs: 3, naziv: "Laptop", dostupnost: 0, id_admin: 10, datum_vrijeme: "2025-05-18T10:10:00" },
];

export const resursController = {
  getAll: () => new Promise((resolve) => setTimeout(() => resolve(mockResursi.map(createResurs)), 300)),

  create: (newResurs) => new Promise((resolve) => {
    setTimeout(() => {
      const maxId = mockResursi.reduce((max, r) => (r.id_resurs > max ? r.id_resurs : max), 0);
      const resursSaId = { ...newResurs, id_resurs: maxId + 1, datum_vrijeme: new Date().toISOString() };
      mockResursi.push(resursSaId);
      resolve(createResurs(resursSaId));
    }, 300);
  }),

  update: (updatedResurs) => new Promise((resolve, reject) => {
    setTimeout(() => {
      const index = mockResursi.findIndex(r => r.id_resurs === updatedResurs.id_resurs);
      if (index === -1) {
        reject("Resurs nije pronađen");
        return;
      }
      mockResursi[index] = { ...mockResursi[index], ...updatedResurs, datum_vrijeme: new Date().toISOString() };
      resolve(createResurs(mockResursi[index]));
    }, 300);
  }),

  delete: (id) => new Promise((resolve) => {
    setTimeout(() => {
      mockResursi = mockResursi.filter(r => r.id_resurs !== id);
      resolve();
    }, 300);
  }),
};
