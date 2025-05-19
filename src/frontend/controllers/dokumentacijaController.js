import { createDokumentacija } from "../models/dokumentacija.js";

let mockDokumentacije = [
  {
    id_dokument: 1,
    id_pacijent: 1,
    id_usluga: 101,
    datum_vrijeme: "2025-05-15T10:30:00",
    opis: "Drugi pregled",
    dijagnoza: "Prehlada",
    upute: "Odmor i puno tekućine",
    id_lijecnik: 10,
  },
  {
    id_dokument: 3,
    id_pacijent: 1,
    id_usluga: 101,
    datum_vrijeme: "2025-03-15T10:30:00",
    opis: "Prvi pregled",
    dijagnoza: "COVID19",
    upute: "Odmor i puno tekućine. Izolacija!",
    id_lijecnik: 10,
  },
  {
    id_dokument: 2,
    id_pacijent: 2,
    id_usluga: 102,
    datum_vrijeme: "2025-05-16T09:00:00",
    opis: "Kontrola",
    dijagnoza: "Alergija",
    upute: "Izbjegavati alergene",
    id_lijecnik: 11,
  },
];

export const dokumentacijaController = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const dokumentacije = mockDokumentacije.map((d) => createDokumentacija(d));
        resolve(dokumentacije);
      }, 500);
    });
  },

  create: (newDokument) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const maxId = mockDokumentacije.reduce(
          (max, d) => (d.id_dokument > max ? d.id_dokument : max),
          0
        );
        const dokumentSaId = { ...newDokument, id_dokument: maxId + 1 };
        mockDokumentacije.push(dokumentSaId);
        resolve(createDokumentacija(dokumentSaId));
      }, 300);
    });
  },

  update: (updatedDokument) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockDokumentacije.findIndex(
          (d) => d.id_dokument === updatedDokument.id_dokument
        );
        if (index === -1) {
          reject("Dokumentacija nije pronađena");
          return;
        }
        mockDokumentacije[index] = { ...updatedDokument };
        resolve(createDokumentacija(mockDokumentacije[index]));
      }, 300);
    });
  },

  delete: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockDokumentacije = mockDokumentacije.filter((d) => d.id_dokument !== id);
        resolve();
      }, 300);
    });
  },
};
