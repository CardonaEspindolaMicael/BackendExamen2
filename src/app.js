import express from "express";
import cors from "cors";
import router from "./routes/routes.js";
import http from 'http';
import { Server as socketio } from 'socket.io'; // Socket.IO con import
import { Sockets } from './sockets/sockets.js'; // Importamos la clase Sockets

export class Server {

  constructor() {
    this.app = express();
    this.port = process.env.PORT || 3001; // Usamos un solo puerto
    this.server = http.createServer(this.app); // Usamos el servidor HTTP compartido
    this.routerMain = "/api-v1"; 

    // Configuración de Socket.IO
    this.io = new socketio(this.server, {
      cors: {
        origin: "http://localhost:3000", // La URL del cliente React
        methods: ["GET", "POST"]
      }
    });
  }

  middlewares() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(this.routerMain, router);
  }

  configureSockets() {
    new Sockets(this.io);
  }

  execute() {
    this.middlewares();
    this.configureSockets();

    // Iniciamos el servidor HTTP que manejará tanto la API como los WebSockets
    this.server.listen(this.port, () => {
      console.log(`Server and Socket.IO running on port ${this.port}`);
    });
  }
}
