import { useState } from "react";

export default function TripForm({ trip }: { trip?: any }) {
  const [name, setName] = useState(trip?.name || "");

  const handleSubmit = async () => {
    const method = trip ? "PUT" : "POST";
    const url = trip
      ? `http://localhost:8080/api/trips/${trip.id}`
      : "http://localhost:8080/api/trips";

    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
  };

  return (
    <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <input value={name} onChange={(e) => setName(e.target.value)} />
      <button type="submit">{trip ? "Update Trip" : "Create Trip"}</button>
    </form>
  );
}
