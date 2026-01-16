// // import React, { useState, useContext } from "react";
// // import { useNavigate, useParams } from "react-router-dom";
// // import { AuthContext } from "../AuthContext";

// // const RoomAccess = () => {
// //   const navigate = useNavigate();
// //   const { roomId } = useParams();
// //   const { isLoggedIn } = useContext(AuthContext);

// //   const [name, setName] = useState("");
// //   const [room, setRoom] = useState(roomId || "");

// //   const handleJoin = () => {
// //     if (!name || !room) {
// //       alert("Please fill all fields");
// //       return;
// //     }

// //     localStorage.setItem("guestName", name);
// //     localStorage.setItem("guestRoom", room);

// //     navigate(`/room/${room}`);
// //   };

// //   if (isLoggedIn) {
// //     navigate(`/room/${roomId}`);
// //     return null;
// //   }

// //   return (
// //     <div className="flex flex-col gap-3 py-52  items-center">
// //         <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-30 z-0" />

// //       <h2 className="text-3xl md:text-[50px] z-10 font-bold leading-tight text-[#fa1239]">Enter Room Credentials</h2>
// //       <input
// //         type="text"
// //         placeholder="Your Name"
// //         value={name}
// //         onChange={(e) => setName(e.target.value)}
// //         className="border border-[#fa1239] rounded-[20px] py-2 px-6 outline-none w-1/3 z-10"
// //       />
// //       <input
// //         type="text"
// //         placeholder="Room Name / ID"
// //         value={room}
// //         onChange={(e) => setRoom(e.target.value)}
// //         className="border border-[#fa1239] rounded-[20px] py-2 px-6 outline-none w-1/3 z-10"
// //       />
      
// //       <button onClick={handleJoin} className=" bg-[#fa1239] text-white rounded-[20px] py-2 px-6 outline-none w-1/3 z-10 text-center">Join Room</button>
// //     </div>
// //   );
// // };

// // export default RoomAccess;



// import React, { useState, useContext, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { AuthContext } from "../AuthContext";

// const RoomAccess = () => {
//   const navigate = useNavigate();
//   const { roomId } = useParams();
//   const { isLoggedIn } = useContext(AuthContext);

//   const [name, setName] = useState("");
//   const [room, setRoom] = useState(roomId || "");
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState("");

//   // Redirect if already logged in
//   useEffect(() => {
//     if (isLoggedIn && roomId) {
//       navigate(`/room/${roomId}`);
//     }
//   }, [isLoggedIn, roomId, navigate]);

//   const handleJoin = (e) => {
//     e?.preventDefault(); // Prevent default if called from form
    
//     if (!name.trim() || !room.trim()) {
//       setError("Please fill all fields");
//       return;
//     }

//     if (name.trim().length < 2) {
//       setError("Name should be at least 2 characters long");
//       return;
//     }

//     if (room.trim().length < 3) {
//       setError("Room ID should be at least 3 characters long");
//       return;
//     }

//     setError("");
//     setIsLoading(true);

//     // Simulate API call delay
//     setTimeout(() => {
//       localStorage.setItem("guestName", name.trim());
//       localStorage.setItem("guestRoom", room.trim());
//       navigate(`/room/${room.trim()}`);
//     }, 500);
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter') {
//       handleJoin();
//     }
//   };

//   // Show loading state while redirecting logged-in users
//   if (isLoggedIn && roomId) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center">
//           <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#fa1239] mx-auto mb-4"></div>
//           <p className="text-gray-600">Redirecting to room...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 relative">
//       {/* Background Pattern */}
//       <div className="absolute inset-0 bg-grid-pattern pointer-events-none opacity-30 z-0" />
      
//       {/* Content Container */}
//       <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 z-10 border border-gray-200">
//         <div className="text-center mb-8">
//           <h2 className="text-3xl font-bold text-[#fa1239] mb-2">
//             Join Room
//           </h2>
//           <p className="text-gray-600">
//             {roomId ? `Room: ${roomId}` : "Enter room details to join"}
//           </p>
//         </div>

//         {/* Error Message */}
//         {error && (
//           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
//             <p className="text-red-600 text-sm text-center">{error}</p>
//           </div>
//         )}

//         <form onSubmit={handleJoin} className="space-y-6">
//           {/* Name Input */}
//           <div>
//             <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
//               Your Name *
//             </label>
//             <input
//               id="name"
//               type="text"
//               placeholder="Enter your name"
//               value={name}
//               onChange={(e) => {
//                 setName(e.target.value);
//                 setError(""); // Clear error when user starts typing
//               }}
//               onKeyPress={handleKeyPress}
//               className="w-full border border-gray-300 rounded-[12px] py-3 px-4 outline-none focus:border-[#fa1239] focus:ring-2 focus:ring-[#fa1239]/20 transition-all duration-200"
//               disabled={isLoading}
//               autoFocus
//             />
//           </div>

//           {/* Room Input */}
//           <div>
//             <label htmlFor="room" className="block text-sm font-medium text-gray-700 mb-2">
//               Room ID *
//             </label>
//             <input
//               id="room"
//               type="text"
//               placeholder="Enter room ID"
//               value={room}
//               onChange={(e) => {
//                 setRoom(e.target.value);
//                 setError(""); // Clear error when user starts typing
//               }}
//               onKeyPress={handleKeyPress}
//               className="w-full border border-gray-300 rounded-[12px] py-3 px-4 outline-none focus:border-[#fa1239] focus:ring-2 focus:ring-[#fa1239]/20 transition-all duration-200"
//               disabled={isLoading || !!roomId} // Disable if roomId is provided in URL
//             />
//             {roomId && (
//               <p className="text-xs text-gray-500 mt-1">
//                 Room ID from invitation link
//               </p>
//             )}
//           </div>

//           {/* Join Button */}
//           <button 
//             type="submit"
//             disabled={isLoading}
//             className="w-full bg-[#fa1239] text-white rounded-[12px] py-3 px-6 font-medium hover:bg-[#e01134] disabled:bg-[#fa1239]/70 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
//           >
//             {isLoading ? (
//               <div className="flex items-center justify-center">
//                 <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
//                 Joining...
//               </div>
//             ) : (
//               "Join Room"
//             )}
//           </button>
//         </form>

//         {/* Additional Info */}
//         <div className="mt-6 text-center">
//           <p className="text-xs text-gray-500">
//             By joining, you agree to our Terms of Service and Privacy Policy
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default RoomAccess;


import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AuthContext } from "../AuthContext";

const RoomAccess = () => {
  const navigate = useNavigate();
  const { roomId } = useParams();
  const { isLoggedIn } = useContext(AuthContext);

  const [name, setName] = useState("");
  const [room, setRoom] = useState(roomId || "");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // If logged-in user opens this page → directly go to room
  useEffect(() => {
    if (isLoggedIn && roomId) {
      navigate(`/room/${roomId}`);
    }
  }, [isLoggedIn, roomId, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();

    if (!name.trim() || !room.trim()) {
      setError("Please fill all fields");
      return;
    }

    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters");
      return;
    }

    if (room.trim().length < 3) {
      setError("Room ID must be at least 3 characters");
      return;
    }

    setError("");
    setIsLoading(true);

    // 🔥 SAVE GUEST SESSION (IMPORTANT)
    localStorage.setItem("guestName", name.trim());
    localStorage.setItem("guestRoom", room.trim());
    localStorage.setItem("guestJoinedAt", Date.now());

    setTimeout(() => {
      navigate(`/room/${room.trim()}`);
    }, 300);
  };

  if (isLoggedIn && roomId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        Redirecting...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-8">
        <h2 className="text-3xl font-bold text-center text-[#fa1239] mb-6">
          Join Room
        </h2>

        {error && (
          <div className="mb-4 text-red-600 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleJoin} className="space-y-4">
          <input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border rounded px-4 py-2"
            disabled={isLoading}
          />

          <input
            type="text"
            placeholder="Room ID"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            className="w-full border rounded px-4 py-2"
            disabled={isLoading || !!roomId}
          />

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-[#fa1239] text-white py-2 rounded"
          >
            {isLoading ? "Joining..." : "Join Room"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RoomAccess;
