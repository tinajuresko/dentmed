import { createPacijent } from "../models/pacijent.js";

let mockPacijenti = [
  {
    id_pacijent: 1,
    ime: "Marko",
    prezime: "Marković",
    oib: "12345678",
    datum_rod: "1980-05-15",
    spol: "M",
    adresa: "Ulica 1",
    mjesto: "Zagreb",
    br_tel: "0912345678",
    email: "marko@example.com",
    id_lijecnik: 10,
  },
  {
    id_pacijent: 2,
    ime: "Ivana",
    prezime: "Ivanković",
    oib: "87654321",
    datum_rod: "1990-08-22",
    spol: "Ž",
    adresa: "Ulica 2",
    mjesto: "Split",
    br_tel: "0987654321",
    email: "ivana@example.com",
    id_lijecnik: 11,
  },
  {
    id_pacijent: 3,
    ime: "Marko",
    prezime: "Marković",
    oib: "12345678",
    datum_rod: "1980-05-15",
    spol: "M",
    adresa: "Ulica 1",
    mjesto: "Zagreb",
    br_tel: "0912345678",
    email: "marko@example.com",
    id_lijecnik: 10,
  },
  {
    id_pacijent: 4,
    ime: "Marko",
    prezime: "Marković",
    oib: "12345678",
    datum_rod: "1980-05-15",
    spol: "M",
    adresa: "Ulica 1",
    mjesto: "Zagreb",
    br_tel: "0912345678",
    email: "marko@example.com",
    id_lijecnik: 10,
  },
  {
    id_pacijent: 5,
    ime: "Marko",
    prezime: "Marković",
    oib: "12345678",
    datum_rod: "1980-05-15",
    spol: "M",
    adresa: "Ulica 1",
    mjesto: "Zagreb",
    br_tel: "0912345678",
    email: "marko@example.com",
    id_lijecnik: 10,
  },
  {
    id_pacijent: 6,
    ime: "Marko",
    prezime: "Marković",
    oib: "12345678",
    datum_rod: "1980-05-15",
    spol: "M",
    adresa: "Ulica 1",
    mjesto: "Zagreb",
    br_tel: "0912345678",
    email: "marko@example.com",
    id_lijecnik: 10,
  },
  {
    id_pacijent: 7,
    ime: "Marko",
    prezime: "Marković",
    oib: "12345678",
    datum_rod: "1980-05-15",
    spol: "M",
    adresa: "Ulica 1",
    mjesto: "Zagreb",
    br_tel: "0912345678",
    email: "marko@example.com",
    id_lijecnik: 10,
  },
  {
    id_pacijent: 8,
    ime: "Marko",
    prezime: "Marković",
    oib: "12345678",
    datum_rod: "1980-05-15",
    spol: "M",
    adresa: "Ulica 1",
    mjesto: "Zagreb",
    br_tel: "0912345678",
    email: "marko@example.com",
    id_lijecnik: 10,
  },
];

export const pacijentController = {
    getAll: () => {
        // Simuliran async poziv s Promise-om i delay-em
        return new Promise((resolve) => {
        setTimeout(() => {
            const pacijenti = mockPacijenti.map((p) => createPacijent(p));
            resolve(pacijenti);
        }, 500);
        });
    },

    update: (updatedPacijent) => {
        return new Promise((resolve, reject) => {
        setTimeout(() => {
            const index = mockPacijenti.findIndex((p) => p.id_pacijent === updatedPacijent.id_pacijent);
            if (index === -1) {
            reject("Pacijent nije pronađen");
            return;
            }
            mockPacijenti[index] = { ...updatedPacijent };
            resolve(createPacijent(mockPacijenti[index]));
        }, 300);
        });
    },

    delete: (id) => {
        return new Promise((resolve) => {
        setTimeout(() => {
            mockPacijenti = mockPacijenti.filter((p) => p.id_pacijent !== id);
            resolve();
        }, 300);
        });
    },

    create: (newPacijent) => {
        return new Promise((resolve) => {
        setTimeout(() => {
            const maxId = mockPacijenti.reduce((max, p) => (p.id_pacijent > max ? p.id_pacijent : max), 0);
            const pacijentSaId = { ...newPacijent, id_pacijent: maxId + 1 };
            mockPacijenti.push(pacijentSaId);
            resolve(createPacijent(pacijentSaId));
        }, 300);
        });
    },
  
};
