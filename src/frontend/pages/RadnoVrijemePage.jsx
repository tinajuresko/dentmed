import React, { useEffect, useState } from "react";
import { radnoVrijemeController } from "../controllers/radnoVrijemeController";
import { zaposlenikController } from "../controllers/zaposlenikController";

export default function RadnoVrijemePage() {
  const [smjene, setSmjene] = useState([]);
  const [zaposlenici, setZaposlenici] = useState([]);
  const [novaSmjena, setNovaSmjena] = useState({ pocetak: "", kraj: "" });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const smjene = await radnoVrijemeController.getAll();
    const zaposlenici = await zaposlenikController.getAll();
    setSmjene(smjene);
    setZaposlenici(zaposlenici);
  };

  const handleAdd = async () => {
    if (!novaSmjena.pocetak || !novaSmjena.kraj) {
      alert("Popunite oba vremena.");
      return;
    }
    await radnoVrijemeController.create(novaSmjena);
    setNovaSmjena({ pocetak: "", kraj: "" });
    loadData();
  };

  const handleDelete = async (id) => {
    await radnoVrijemeController.delete(id);
    loadData();
  };

  const handleAssign = async (id_zaposlenik, id_radno_vrijeme) => {
    const zaposlenik = zaposlenici.find(z => z.id_zaposlenik === id_zaposlenik);
    if (!zaposlenik) return;
    await zaposlenikController.update({ ...zaposlenik, id_radno_vrijeme });
    loadData();
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Radna vremena (smjene)</h2>
      <table border="1" cellPadding="6" style={{ marginBottom: 20 }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Početak</th>
            <th>Kraj</th>
            <th>Akcije</th>
          </tr>
        </thead>
        <tbody>
          {smjene.map((s) => (
            <tr key={s.id_smjena}>
              <td>{s.id_smjena}</td>
              <td>{s.pocetak}</td>
              <td>{s.kraj}</td>
              <td>
                <button onClick={() => handleDelete(s.id_smjena)}>Obriši</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Dodaj novu smjenu</h3>
      <input
        type="time"
        value={novaSmjena.pocetak}
        onChange={(e) => setNovaSmjena({ ...novaSmjena, pocetak: e.target.value })}
      />
      <input
        type="time"
        value={novaSmjena.kraj}
        onChange={(e) => setNovaSmjena({ ...novaSmjena, kraj: e.target.value })}
      />
      <button onClick={handleAdd}>Dodaj</button>

      <h2 style={{ marginTop: 40 }}>Zaposlenici i njihove smjene</h2>
      <table border="1" cellPadding="6">
        <thead>
          <tr>
            <th>Zaposlenik</th>
            <th>Trenutna smjena</th>
            <th>Dodijeli novu smjenu</th>
          </tr>
        </thead>
        <tbody>
          {zaposlenici.map((z) => (
            <tr key={z.id_zaposlenik}>
              <td>{z.ime} {z.prezime}</td>
              <td>{z.id_radno_vrijeme || "-"}</td>
              <td>
                <select
                  value={z.id_radno_vrijeme || ""}
                  onChange={(e) => handleAssign(z.id_zaposlenik, parseInt(e.target.value))}
                >
                  <option value="">Odaberi</option>
                  {smjene.map((s) => (
                    <option key={s.id_smjena} value={s.id_smjena}>
                      {s.pocetak} - {s.kraj}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}