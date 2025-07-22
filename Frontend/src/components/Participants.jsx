export default function ParticipantsList() {
  const participants = ['You', 'Alice', 'Bob', 'Charlie'];

  return (
    <div className="p-2 border-b h-1/2 overflow-auto">
      <h2 className="text-lg font-semibold mb-2">Participants</h2>
      <ul>
        {participants.map((name, i) => (
          <li key={i} className="py-1">{name}</li>
        ))}
      </ul>
    </div>
  );
}
