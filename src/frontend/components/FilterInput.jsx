import React, { useState } from "react";

export default function FilterInput({ data, onFilter, fields = [] }) {
  const [query, setQuery] = useState("");

  const handleChange = (e) => {
    const q = e.target.value.toLowerCase();
    setQuery(q);

    const filtered = data.filter((item) => {
      const keys = fields.length ? fields : Object.keys(item);
      return keys.some((k) => {
        const val = item[k];
        return typeof val === "string" && val.toLowerCase().includes(q);
      });
    });

    onFilter(filtered);
  };

  return (
    <input
      type="text"
      placeholder="Filtriraj..."
      value={query}
      onChange={handleChange}
      style={{ marginBottom: 12, padding: 6, width: "50%" }}
    />
  );
}
