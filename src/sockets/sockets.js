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
            const { de,para, mensaje } = data;
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
