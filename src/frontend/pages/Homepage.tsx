const Homepage = () => {
  return (
    <div style={{ fontFamily: "sans-serif", color: "#333" }}>
      {/* Hero Section */}
      <div
        style={{
          backgroundColor: "#e0f7fa",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          justifyContent: "center",
          height: "300px",
        }}
      >
        <img src="logo.png" style={{ width: "200px", height: "200px" }}></img>
        <section
          style={{
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontSize: "3rem",
              marginBottom: "20px",
              textShadow: "1px 1px gray",
            }}
          >
            Dentalna poliklinika <span style={{ color: "#00796b" }}>ŠVARC</span>
          </h1>
          <p
            style={{ fontSize: "1.2rem", maxWidth: "600px", margin: "0 auto" }}
          >
            Brinemo o vašem osmijehu uz najmoderniju tehnologiju i stručan tim.
          </p>
        </section>
      </div>

      {/* Usluge */}
      <section
        style={{
          padding: "40px 20px",
          maxWidth: "1000px",
          margin: "0 auto",
          textAlign: "center",
        }}
      >
        <h2>Naše usluge</h2>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "20px",
          }}
        >
          {[
            "Opća stomatologija",
            "Implantologija",
            "Estetska stomatologija",
          ].map((usluga, index) => (
            <div
              key={index}
              style={{
                backgroundColor: "#f5f5f5",
                margin: "10px",
                padding: "20px",
                borderRadius: "8px",
                minWidth: "250px",
                flex: "1 1 300px",
              }}
            >
              <h3>{usluga}</h3>
            </div>
          ))}
        </div>
      </section>

      {/* O nama */}
      <section
        style={{
          padding: "40px 20px",
          backgroundColor: "#fafafa",
          textAlign: "center",
        }}
      >
        <h2>O nama</h2>
        <p style={{ maxWidth: "700px", margin: "20px auto" }}>
          Poliklinika Švarc djeluje više od 20 godina u srcu grada, s naglaskom
          na individualni pristup svakom pacijentu. Naš tim čine vrhunski
          stomatolozi s dugogodišnjim iskustvom.
        </p>
      </section>
    </div>
  );
};

export default Homepage;
