function Itinerary({ tripId }: { tripId: string }) {
  const [days, setDays] = useState<any[]>([]);

  useEffect(() => {
    fetch(`http://localhost:8080/api/trips/${tripId}/itinerary`)
      .then(res => res.json())
      .then(data => setDays(data));
  }, [tripId]);

  const addDay = async () => {
    await fetch(`http://localhost:8080/api/trips/${tripId}/itinerary`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ day: days.length + 1 }),
    });
  };

  return (
    <div>
      <h3>Itinerary</h3>
      <button onClick={addDay}>Add Day</button>
      {days.map(day => (
        <div key={day.id}>
          <h4>Day {day.dayNumber}</h4>
          {day.activities.map((act: any) => (
            <p key={act.id}>{act.name}</p>
          ))}
        </div>
      ))}
    </div>
  );
}
