export default function VideoGrid() {
  // Dummy data
  const users = ['You', 'Alice', 'Bob', 'Charlie'];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {users.map((user, idx) => (
        <div key={idx} className="bg-gray-900 text-white h-48 flex items-center justify-center rounded">
          {user}'s Video
        </div>
      ))}
    </div>
  );
}
