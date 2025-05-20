import { createTermin } from "../models/termin.js";

let mockTermini = [
  {
    id_termin: 1,
    datum: "2025-05-22",
    vrijeme: "10:00",
    trajanje: "30min",
    napomena: "Kontrola",
    id_pacijent: 1,
    id_lijecnik: 10,
  },
  {
    id_termin: 2,
    datum: "2025-05-23",
    vrijeme: "11:00",
    trajanje: "45min",
    napomena: "Prvi pregled",
    id_pacijent: null,
    id_lijecnik: 10,
  },
];

export const terminController = {
  getAll: () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(mockTermini.map((t) => createTermin(t)));
      }, 500);
    });
  },

  create: (newTermin) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        // 1. Validacija: termin ne smije biti u prošlosti
        const terminDateTime = new Date(`${newTermin.datum}T${newTermin.vrijeme}`);
        if (terminDateTime < new Date()) {
          reject("Termin ne može biti u prošlosti.");
          return;
        }
  
        // 2. Validacija: liječnik već ima termin u to vrijeme
        const konfliktLijecnik = mockTermini.some(
          (t) =>
            t.id_lijecnik === newTermin.id_lijecnik &&
            t.datum === newTermin.datum &&
            t.vrijeme === newTermin.vrijeme
        );
        if (konfliktLijecnik) {
          reject("Liječnik već ima termin u to vrijeme.");
          return;
        }
  
        // 3. Validacija: pacijent već ima termin u to vrijeme
        if (newTermin.id_pacijent !== null) {
          const konfliktPacijent = mockTermini.some(
            (t) =>
              t.id_pacijent === newTermin.id_pacijent &&
              t.datum === newTermin.datum &&
              t.vrijeme === newTermin.vrijeme
          );
          if (konfliktPacijent) {
            reject("Pacijent već ima zakazan termin u to vrijeme.");
            return;
          }
        }
  
        // Ako sve prolazi, dodaj termin
        const maxId = mockTermini.reduce((max, t) => (t.id_termin > max ? t.id_termin : max), 0);
        const terminSaId = { ...newTermin, id_termin: maxId + 1 };
        mockTermini.push(terminSaId);
        resolve(createTermin(terminSaId));
      }, 300);
    });
  },  

  delete: (id) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        mockTermini = mockTermini.filter((t) => t.id_termin !== id);
        resolve();
      }, 300);
    });
  },

  update: (updatedTermin) => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const index = mockTermini.findIndex((t) => t.id_termin === updatedTermin.id_termin);
        if (index === -1) {
          reject("Termin nije pronađen");
          return;
        }
  
        // 1. Validacija: termin ne smije biti u prošlosti
        const terminDateTime = new Date(`${updatedTermin.datum}T${updatedTermin.vrijeme}`);
        if (terminDateTime < new Date()) {
          reject("Termin ne može biti u prošlosti.");
          return;
        }
  
        // 2. Validacija: liječnik već ima termin u to vrijeme
        const konfliktLijecnik = mockTermini.some(
          (t) =>
            t.id_termin !== updatedTermin.id_termin &&
            t.id_lijecnik === updatedTermin.id_lijecnik &&
            t.datum === updatedTermin.datum &&
            t.vrijeme === updatedTermin.vrijeme
        );
        if (konfliktLijecnik) {
          reject("Liječnik već ima termin u to vrijeme.");
          return;
        }
  
        // 3. Validacija: pacijent već ima termin u to vrijeme
        if (updatedTermin.id_pacijent !== null) {
          const konfliktPacijent = mockTermini.some(
            (t) =>
              t.id_termin !== updatedTermin.id_termin &&
              t.id_pacijent === updatedTermin.id_pacijent &&
              t.datum === updatedTermin.datum &&
              t.vrijeme === updatedTermin.vrijeme
          );
          if (konfliktPacijent) {
            reject("Pacijent već ima zakazan termin u to vrijeme.");
            return;
          }
        }
  
        // Ako sve prolazi, ažuriraj
        mockTermini[index] = { ...updatedTermin };
        resolve(createTermin(mockTermini[index]));
      }, 300);
    });
  },  
};
