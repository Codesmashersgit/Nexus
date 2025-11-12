import { io } from "socket.io-client";

const SERVER_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";
export const socket = io(SERVER_URL, { transports: ["websocket"] });
