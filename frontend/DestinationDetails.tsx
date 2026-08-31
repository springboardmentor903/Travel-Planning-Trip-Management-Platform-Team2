import { useEffect, useState } from "react";

export default function DestinationDetails({ id }: { id: string }) {
  const [destination, setDestination] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/destinations/${id}`)
      .then(res => res.json())
      .then(data => setDestination(data));
  }, [id]);

  if (!destination) return <p>Loading...</p>;

  return (
    <div>
      <h2>{destination.name}</h2>
      <p>{destination.description}</p>
      <p>Weather: {destination.weather}</p>
    </div>
  );
}
