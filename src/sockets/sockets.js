import { obtenerUsuariosById } from "../components/user/user.models.js";
import { getLatestPageData } from "../helpers/saving.js";
import { validateJsonWebToken } from "../helpers/validateJsonWebToken.js";

export class Sockets {

  constructor(io) { 
    this.io = io;
    this.locks = {}; // Añadir un objeto para gestionar los bloqueos
    this.socketEvents(); 
  } 

  socketEvents() {
    this.io.on('connection', async (socket) =>  { 
        // Validar JWT y obtener el ID del cliente (ci)
        const [valido, verified] = validateJsonWebToken(socket.handshake.query['x-token']);
        if (!valido) {
            return socket.disconnect();
        }

   //    console.log(`Usuario conectado: ${verified.correo}`);
        socket.join(verified.ci);

        // Manejar eventos de 'join-room'
        socket.on('join-room', async (room) => {
            socket.join(room);
      //      console.log(`Usuario ${verified.nombre} se unio a la sala ${room}`);
        });

        // **NUEVO: Unirse a sala de chat con IA**
        socket.on('join-ai-chat', async (room) => {
            const chatRoom = `ai-chat-${room}`;
            socket.join(chatRoom);
            console.log(`Usuario ${verified.nombre} se unió al chat IA de la sala ${room}`);
        });

        // **NUEVO: Manejar mensajes al chat IA**
        socket.on('send-ai-message', async (data) => {
            const { room, message, htmlCode } = data;
            const chatRoom = `ai-chat-${room}`;
            
            try {
                // Emitir el mensaje del usuario a todos en la sala
                this.io.to(chatRoom).emit('user-message', {
                    sender: 'user',
                    text: message,
                    timestamp: new Date(),
                    userId: verified.ci
                });

                // Emitir indicador de que la IA está escribiendo
                this.io.to(chatRoom).emit('ai-typing', { isTyping: true });

                // Llamar al endpoint de Gemini AI
                const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCSE5rW6Qn9JsIoCXGkgdYeGP3QHSP4lho';
                const response = await fetch(`http://localhost:3001/api-v1/ai-gemini/realTimeChat/${apiKey}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ 
                        htmlCode: htmlCode || '',
                        clientPrompt: message 
                    })
                });

                if (!response.ok) {
                    throw new Error(`Error HTTP: ${response.status}`);
                }

                const aiResponse = await response.json();

                // Simular un pequeño delay para hacer más realista la experiencia
                setTimeout(() => {
                    // Desactivar indicador de typing
                    this.io.to(chatRoom).emit('ai-typing', { isTyping: false });
                    
                    // Emitir la respuesta de la IA (tanto el HTML como la respuesta)
                    this.io.to(chatRoom).emit('ai-message', {
                        sender: 'ai',
                        text: aiResponse.AIResponse,
                        newHtml: aiResponse.newHtml,
                        timestamp: new Date()
                    });
                }, 1500); // 1.5 segundos de delay

            } catch (error) {
                console.error('Error en chat IA:', error);
                
                // Desactivar typing en caso de error
                this.io.to(chatRoom).emit('ai-typing', { isTyping: false });
                
                // Emitir error solo al usuario que envió el mensaje
                socket.emit('ai-chat-error', {
                    error: 'No se pudo obtener respuesta de la IA. Intenta nuevamente.',
                    timestamp: new Date()
                });
            }
        });

        // **NUEVO: Salir del chat IA**
        socket.on('leave-ai-chat', async (room) => {
            const chatRoom = `ai-chat-${room}`;
            socket.leave(chatRoom);
            console.log(`Usuario ${verified.nombre} dejó el chat IA de la sala ${room}`);
        });

        // Escuchar eventos de 'diagram-update' y hacer broadcast a la sala
        socket.on('diagram-update', (data, room) => {
            socket.to(room).emit('diagram-update', data);
        });

        socket.on('user-update', (data, room) => {
            socket.to(room).emit('user-update', data);
        });

        // Manejar el evento para dejar la sala
        socket.on('leave-room', async (room) => {
            socket.leave(room);
        //    console.log(`Usuario ${verified.nombre} dejó la sala ${room}`);
        });

        socket.on('enviar-invitacion', async (data) => {
            const { de, para, mensaje } = data;
         //   console.log(`Enviando invitación a ${para} con mensaje: ${mensaje}`);
            const existeUsuario = await obtenerUsuariosById(para);
            
            if (!existeUsuario) {
                return socket.emit('error', 'El usuario no existe revise el ci');
            }
          //  console.log('llegue aqui',existeUsuario)
            this.io.to(para).emit('enviar-invitacion', mensaje); 
        });

        // Solicitud de datos de una página específica
        socket.on('requestPageData', (request, room) => {
            const { pageId, userId } = request;
            
            // Obtener los datos más recientes para esta página
            const pageData = getLatestPageData(room, pageId);
            
            // Enviar datos solo al usuario que lo solicitó
            socket.emit('pageDataResponse', {
                pageId: pageId,
                components: pageData.components,
                css: pageData.css,
                timestamp: pageData.timestamp
            });
        });

        // Desconectar usuario
        socket.on('disconnect', () => {
        //   console.log(`Usuario ${verified.correo} desconectado`);
          socket.disconnect();
        });
    });
  }
}