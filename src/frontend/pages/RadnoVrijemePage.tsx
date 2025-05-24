import React, { useEffect, useState } from "react";
import { radnoVrijemeController } from "../controllers/radnoVrijemeController";
import { zaposlenikController } from "../controllers/zaposlenikController";
import { RadnoVrijeme } from "../models/radnovrijeme";
import { Zaposlenik } from "../models/Zaposlenik";

export default function RadnoVrijemePage() {
  const [smjene, setSmjene] = useState<RadnoVrijeme[]>([]);
  const [zaposlenici, setZaposlenici] = useState<Zaposlenik[]>([]);
  const [novaSmjena, setNovaSmjena] = useState({
    id_smjena: 0,
    pocetak: "",
    kraj: "",
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const smjene = await radnoVrijemeController.getAll();
    const zaposlenici = await zaposlenikController.getAll();
    setSmjene(smjene);
    setZaposlenici(zaposlenici);
  }

  const handleAdd = async () => {
    if (!novaSmjena.pocetak || !novaSmjena.kraj) {
      alert("Popunite oba vremena.");
      return;
    }
    await radnoVrijemeController.create(novaSmjena);
    setNovaSmjena({ id_smjena: 0, pocetak: "", kraj: "" });
    loadData();
  };

  const handleDelete = async (id) => {
    await radnoVrijemeController.delete(id);
    loadData();
  };

  const handleAssign = async (id_zaposlenik, id_radno_vrijeme) => {
    const zaposlenik = zaposlenici.find(
      (z) => z.id_zaposlenik === id_zaposlenik
    );
    if (!zaposlenik) return;
    await zaposlenikController.update(id_zaposlenik, {
      ...zaposlenik,
      id_radno_vrijeme,
    });
    loadData();
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "20px",
      }}
    >
      <h1>⌛ Radna vremena (smjene)</h1>
      <table cellPadding="6">
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
              <td>
                <strong>{s.pocetak}</strong>
              </td>
              <td>
                <strong>{s.kraj}</strong>
              </td>
              <td>
                <button onClick={() => handleDelete(s.id_smjena)}>
                  Obriši
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          backgroundColor: "whitesmoke",
          padding: "10px 0px",
          margin: "20px 0px",
          borderRadius: "8px",
          minWidth: "500px",
        }}
      >
        <h3>Dodaj novu smjenu</h3>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "20px",
            padding: "20px 0px",
          }}
        >
          <p>od</p>
          <input
            placeholder="npr. 00:00:00 sati"
            value={novaSmjena.pocetak}
            onChange={(e) =>
              setNovaSmjena({ ...novaSmjena, pocetak: e.target.value })
            }
          />
          <p>do</p>
          <input
            placeholder="npr. 00:00:00 sati"
            value={novaSmjena.kraj}
            onChange={(e) =>
              setNovaSmjena({ ...novaSmjena, kraj: e.target.value })
            }
          />
        </div>
        <button onClick={handleAdd}>Dodaj</button>
      </div>

      <h2 style={{ marginTop: 40 }}>Zaposlenici i njihove smjene</h2>
      <table cellPadding="6" style={{ border: "1px solid black" }}>
        <thead>
          <tr>
            <th></th>
            <th>Zaposlenik</th>
            <th>Trenutna smjena</th>
            <th>Dodijeli novu smjenu</th>
          </tr>
        </thead>
        <tbody>
          {zaposlenici.map((z) => (
            <tr key={z.id_zaposlenik}>
              <td style={{ fontSize: "larger" }}>
                {z.spol == "Ž" ? "👩🏼‍⚕️" : "👨🏻‍⚕️"}
              </td>
              <td>
                {z.ime} {z.prezime}
              </td>
              <td>{z.id_radno_vrijeme || "-"}</td>
              <td>
                <select
                  value={z.id_radno_vrijeme || ""}
                  onChange={(e) =>
                    handleAssign(z.id_zaposlenik, parseInt(e.target.value))
                  }
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
