import React, { useEffect, useState } from "react";
import { terminController } from "../controllers/terminController";
import { lijecnikController } from "../controllers/lijecnikControllers.js";
import FilterInput from "../components/FilterInput";

export default function TerminiPage() {
  const [lijecnici, setLijecnici] = useState([]);
  const [termini, setTermini] = useState([]);
  const [filteredTermini, setFilteredTermini] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingTermin, setEditingTermin] = useState(null);

  const [newTermin, setNewTermin] = useState({
    datum: "",
    vrijeme: "",
    trajanje: "",
    napomena: "",
    id_pacijent: null,
    id_lijecnik: "",
  });

  useEffect(() => {
    loadTermini();
    lijecnikController.getAll().then(setLijecnici);
  }, []);

  const loadTermini = async () => {
    setLoading(true);
    const data = await terminController.getAll();
    setTermini(data);
    setFilteredTermini(data);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    await terminController.delete(id);
    loadTermini();
  };

  const handleAdd = async () => {
    if (
      !newTermin.datum ||
      !newTermin.vrijeme ||
      !newTermin.trajanje ||
      !newTermin.id_lijecnik
    ) {
      alert("Molimo popunite sva obavezna polja.");
      return;
    }

    try {
      await terminController.create(newTermin);
      setNewTermin({
        datum: "",
        vrijeme: "",
        trajanje: "",
        napomena: "",
        id_pacijent: null,
        id_lijecnik: "",
      });
      loadTermini();
    } catch (err) {
      alert(err);
    }
  };

  const handleUpdate = async () => {
    if (
      !newTermin.datum ||
      !newTermin.vrijeme ||
      !newTermin.trajanje ||
      !newTermin.id_lijecnik
    ) {
      alert("Molimo popunite sva obavezna polja.");
      return;
    }

    try {
      await terminController.update(newTermin);
      setEditingTermin(null);
      setNewTermin({
        datum: "",
        vrijeme: "",
        trajanje: "",
        napomena: "",
        id_pacijent: null,
        id_lijecnik: "",
      });
      loadTermini();
    } catch (err) {
      alert(err);
    }
  };

  const terminiZaFilter = termini.map((termin) => {
    const lijecnik = lijecnici.find(
      (l) => l.id_lijecnik === termin.id_lijecnik
    );
    return {
      ...termin,
      lijecnikIme: lijecnik
        ? `${lijecnik.ime} ${lijecnik.prezime}`.toLowerCase()
        : "",
    };
  });

  useEffect(() => {
    if (editingTermin) {
      setNewTermin({ ...editingTermin });
    }
  }, [editingTermin]);

  return (
    <div style={{ padding: 20 }}>
      <h1>🗓️ Termini</h1>

      {loading ? (
        <p>Učitavanje termina...</p>
      ) : (
        <>
          {/* Filter po imenu liječnika */}
          <FilterInput
            data={terminiZaFilter}
            onFilter={(filtered) => {
              const filteredIds = new Set(filtered.map((f) => f.id_termin));
              setFilteredTermini(
                termini.filter((t) => filteredIds.has(t.id_termin))
              );
            }}
            fields={["lijecnikIme"]}
          />

          <table
            border="1"
            cellPadding="8"
            style={{ width: "100%", marginBottom: 20 }}
          >
            <thead>
              <tr>
                <th>Datum</th>
                <th>Vrijeme</th>
                <th>Trajanje</th>
                <th>Napomena</th>
                <th>Pacijent</th>
                <th>Liječnik</th>
                <th>Akcije</th>
              </tr>
            </thead>
            <tbody>
              {filteredTermini.map((termin) => (
                <tr key={termin.id_termin}>
                  <td>{termin.datum}</td>
                  <td>{termin.vrijeme}</td>
                  <td>{termin.trajanje}</td>
                  <td>{termin.napomena}</td>
                  <td>
                    {termin.id_pacijent ? termin.id_pacijent : "Slobodno"}
                  </td>
                  <td>
                    {lijecnici.find((l) => l.id_lijecnik === termin.id_lijecnik)
                      ? `${
                          lijecnici.find(
                            (l) => l.id_lijecnik === termin.id_lijecnik
                          ).ime
                        } ${
                          lijecnici.find(
                            (l) => l.id_lijecnik === termin.id_lijecnik
                          ).prezime
                        }`
                      : "-"}
                  </td>
                  <td>
                    <button onClick={() => setEditingTermin(termin)}>
                      Uredi
                    </button>
                    <button onClick={() => handleDelete(termin.id_termin)}>
                      Obriši
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <h3>Dodaj novi termin</h3>
          {editingTermin && (
            <p style={{ color: "orange" }}>
              Uređujete termin ID: {editingTermin.id_termin}
            </p>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <input
              type="date"
              value={newTermin.datum}
              onChange={(e) =>
                setNewTermin({ ...newTermin, datum: e.target.value })
              }
            />
            <input
              type="time"
              value={newTermin.vrijeme}
              onChange={(e) =>
                setNewTermin({ ...newTermin, vrijeme: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Trajanje"
              value={newTermin.trajanje}
              onChange={(e) =>
                setNewTermin({ ...newTermin, trajanje: e.target.value })
              }
            />
            <input
              type="number"
              placeholder="ID pacijenta"
              value={newTermin.id_pacijent || ""}
              onChange={(e) =>
                setNewTermin({
                  ...newTermin,
                  id_pacijent: e.target.value ? parseInt(e.target.value) : null,
                })
              }
            />
            <input
              type="text"
              placeholder="Napomena"
              value={newTermin.napomena}
              onChange={(e) =>
                setNewTermin({ ...newTermin, napomena: e.target.value })
              }
            />

            <select
              value={newTermin.id_lijecnik}
              onChange={(e) =>
                setNewTermin({
                  ...newTermin,
                  id_lijecnik: parseInt(e.target.value),
                })
              }
            >
              <option value="">Odaberi liječnika</option>
              {lijecnici.map((l) => (
                <option key={l.id_lijecnik} value={l.id_lijecnik}>
                  {l.ime} {l.prezime}
                </option>
              ))}
            </select>

            {editingTermin ? (
              <>
                <button onClick={handleUpdate}>Spremi izmjene</button>
                <button
                  onClick={() => {
                    setEditingTermin(null);
                    setNewTermin({
                      datum: "",
                      vrijeme: "",
                      trajanje: "",
                      napomena: "",
                      id_pacijent: null,
                      id_lijecnik: "",
                    });
                  }}
                >
                  Odustani
                </button>
              </>
            ) : (
              <button onClick={handleAdd}>Dodaj</button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
