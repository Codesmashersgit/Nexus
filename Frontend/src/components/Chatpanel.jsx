import { useState } from 'react';

export default function ChatPanel() {
  const [messages, setMessages] = useState([{ sender: 'Alice', text: 'Hi!' }]);
  const [newMsg, setNewMsg] = useState('');

  const handleSend = () => {
    if (!newMsg.trim()) return;
    setMessages([...messages, { sender: 'You', text: newMsg }]);
    setNewMsg('');
  };

  return (
    <div className="p-2 flex flex-col flex-1">
      <h2 className="text-lg font-semibold mb-2">Chat</h2>
      <div className="flex-1 overflow-auto mb-2">
        {messages.map((msg, idx) => (
          <div key={idx} className="mb-1">
            <strong>{msg.sender}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex">
        <input
          className="flex-1 border rounded-l px-2 py-1"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Type a message"
        />
        <button className="bg-blue-500 text-white px-4 rounded-r" onClick={handleSend}>
          Send
        </button>
      </div>
    </div>
  );
}
