import { useEffect, useState } from "react";

export default function TripDetails({ tripId }: { tripId: string }) {
  const [trip, setTrip] = useState<any>(null);

  useEffect(() => {
    fetch(`http://localhost:8080/api/trips/${tripId}`)
      .then(res => res.json())
      .then(data => setTrip(data));
  }, [tripId]);

  if (!trip) return <p>Loading...</p>;

  return (
    <div>
      <h2>{trip.name}</h2>
      <p>{trip.description}</p>
    </div>
  );
}
