import { useEffect, useState } from "react";

export default function TripList() {
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8080/api/trips")
      .then(res => res.json())
      .then(data => setTrips(data));
  }, []);

  return (
    <div>
      <h2>Your Trips</h2>
      <ul>
        {trips.map((trip: any) => (
          <li key={trip.id}>{trip.name}</li>
        ))}
      </ul>
    </div>
  );
}
