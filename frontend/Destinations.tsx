import { useEffect, useState } from "react";

export default function Destinations() {
  const [destinations, setDestinations] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/destinations")
      .then(res => res.json())
      .then(data => setDestinations(data));
  }, []);

  return (
    <div>
      <h2>Destinations</h2>
      <ul>
        {destinations.map((d: any) => (
          <li key={d.id}>{d.name}</li>
        ))}
      </ul>
    </div>
  );
}
