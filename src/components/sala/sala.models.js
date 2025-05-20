import pkg from '@prisma/client';
const {PrismaClient} = pkg;
const prisma = new PrismaClient();
export const obtenerSalasModel = async () => {
    try {
      return await prisma.sala.findMany();
    } catch (error) {
      console.error(error); 
      throw error;
    }
  };
  

  export const obtenerLosUsuariosDeUnaSalaModel = async (id) => {
    try {
      return await prisma.usuarioSala.findMany({
        where: { idSala:id },
        include: {
          usuario: {
            select: {
              nombre: true,
              correo: true,
              telefono: true
            }
          }
        }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };

  
  


  export const getSalasByIdModel = async (id) => {
    try {
      return await prisma.sala.findUnique({ where: { id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  export const getSalasByCiModel = async (ci) => {
    try {
        return await prisma.sala.findMany({ where: { ciHost: ci } });

    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  

  export const crearSalaModel = async (datos) => {
    try {
        const {nombre, capacidad, descripcion, esPrivada, ciHost,diagrama}=datos
      return await prisma.sala.create({
        data: {
          nombre,
          capacidad,
          descripcion,
          esPrivada,
          ciHost,
          diagrama
        }
      });
    } catch (error) { 
      console.error(error);
      throw error;
    }
  };

  export const agregarUsuarioASalaModel = async (datos) =>{
    try {
    //    const {ciUsuario,idSala,rol,fecha}=datos
      return await prisma.usuarioSala.create({
        data: datos
        
      });
    } catch (error) { 
      console.error(error);
      throw error;
    }
  };
  
  export const actualizarSalaModel = async (id, diagrama) => {
    try {
      return await prisma.sala.update({
        where: { id },
        data: { diagrama }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  export const actualizarSalaModel2 = async (id, nombre, descripcion) => {
    try {
      return await prisma.sala.update({
        where: { id },
        data: {
          nombre,
          descripcion
        }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  export const eliminarSalaModel = async (id) => {
    try {
      await prisma.sala.delete({ where: { id } });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  export const isHostModel = async (ci, id) => {
    try {
      const sala = await prisma.sala.findFirst({
        where: {
          id: id,
          ciHost: ci
        }
      });
      return { ishost: Boolean(sala) };
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  


  export const eliminarUsuarioDeSalaModel = async (ci, id) => {
    try {
      await prisma.usuarioSala.deleteMany({
        where: {
          ciUsuario:ci,
          idSala:id
          
        }
      });
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  

  export const obtenerLasSalasDeUnUsuarioInvitadoModel = async (ci) => {
    try {
      const salas = await prisma.usuarioSala.findMany({
        where: {
          ciUsuario: ci
        },
        select: {
          sala: true
        }
      });
  
      // Opcional: si solo quieres las salas como array limpio
      return salas.map(rel => rel.sala);
    } catch (error) {
      console.error(error);
      throw error;
    }
  };
  
  