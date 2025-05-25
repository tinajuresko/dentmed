import React, { useEffect, useState } from "react";
import { opremaController } from "../controllers/opremaController";
import { prostorController } from "../controllers/prostorController";
import { uredajController } from "../controllers/uredajController";
import { Oprema } from "../models/Oprema";
import { Prostor } from "../models/Prostor";
import { Uredaj } from "../models/Uredaj";

export default function ResursiPage() {
  const [oprema, setOprema] = useState<Oprema[]>([]);
  const [prostori, setProstori] = useState<Prostor[]>([]);
  const [uredaji, setUredaji] = useState<Uredaj[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      const opremaData = await opremaController.getAll();
      const prostoriData = await prostorController.getAll();
      const uredajiData = await uredajController.getAll();
      setOprema(opremaData);
      setProstori(prostoriData);
      setUredaji(uredajiData);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div>Učitavanje resursa...</div>;

  return (
    <div>
      <h2>⚕️ Resursi</h2>

      {/* Oprema */}
      <section
        style={{
          marginBottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Oprema</h2>
        <ul style={{ listStyle: "none", padding: 0, width: "70%" }}>
          {oprema.map((o, ind) => (
            <li
              key={o.id_oprema}
              style={{
                border: "1px solid #ccc",
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
                textAlign: "start",
                backgroundColor: "whitesmoke",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  gap: "40%",
                }}
              >
                <p style={{ fontWeight: "bold", fontSize: "large" }}>
                  {ind + 1}.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p>
                    <strong>Naziv:</strong>{" "}
                    <strong style={{ color: "#00796b" }}>
                      {o.resurs.naziv}
                    </strong>
                  </p>
                  <p>
                    <strong>Proizvođač:</strong> {o.proizvodac}
                  </p>
                  <p>
                    <strong>Kontakt:</strong> {o.kontakt}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Prostori */}
      <section
        style={{
          marginBottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Prostori</h2>
        <ul style={{ listStyle: "none", padding: 0, width: "70%" }}>
          {prostori.map((p, ind) => (
            <li
              key={p.id_prostor}
              style={{
                border: "1px solid #ccc",
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
                textAlign: "start",
                backgroundColor: "whitesmoke",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  gap: "40%",
                }}
              >
                <p style={{ fontWeight: "bold", fontSize: "large" }}>
                  {ind + 1}.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p>
                    <strong>Naziv:</strong>{" "}
                    <strong style={{ color: "#00796b" }}>
                      {p.resurs.naziv}
                    </strong>
                  </p>
                  <p>
                    <strong>Dimenzija:</strong> {p.dimenzija}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Uređaji */}
      <section
        style={{
          marginBottom: 40,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <h2>Uređaji</h2>
        <ul style={{ listStyle: "none", padding: 0, width: "70%" }}>
          {uredaji.map((u, ind) => (
            <li
              key={u.id_uredaj}
              style={{
                border: "1px solid #ccc",
                borderRadius: 5,
                padding: 10,
                marginBottom: 10,
                textAlign: "start",
                backgroundColor: "whitesmoke",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "left",
                  alignItems: "center",
                  gap: "40%",
                }}
              >
                <p style={{ fontWeight: "bold", fontSize: "large" }}>
                  {ind + 1}.
                </p>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <p>
                    <strong>Naziv:</strong>{" "}
                    <strong style={{ color: "#00796b" }}>
                      {u.resurs.naziv}
                    </strong>
                  </p>
                  <p>
                    <strong>Proizvođač:</strong> {u.proizvodac}
                  </p>
                  <p>
                    <strong>Kontakt:</strong> {u.kontakt}
                  </p>
                  <p>
                    <strong>Garancija:</strong> {u.garancija_god} godina
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
