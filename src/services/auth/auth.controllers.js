import bcrypt from "bcrypt"; 
import jwt from "jsonwebtoken"; 
import {obtenerUsuarioPorSuCorreo} from "../../components/user/user.models.js";

export const verifyToken = async (token) => {
  try {
    return jwt.verify(token, process.env.SECRET_KEY_TOKEN)
  } catch (error) {
    return null
  }

}
export const loginUser = async (req, res) => {
    let { correo, contrasena } = req.body;
    correo = correo?.toLowerCase().trim() ; 
    const result = await obtenerUsuarioPorSuCorreo(correo)
    if (!!!result) {
      return res.status(201).json({ message: "El usuario no se encontro!" , success:false}); // Not Found
    }
    try {
      const checkPassword = await bcrypt.compare(contrasena, result.contrasena);
 
      if (!checkPassword) {
        return res.status(201).json({ message: "contrasena incorrecta!" ,  success:false}); // Unauthorized
      } 

      const token = jwt.sign(
        { ci:result.ci,
          correo: result.correo, 
          cargo: result.rol.cargo,
          nombre:result.nombre },
        process.env.SECRET_KEY_TOKEN, 
        {
          expiresIn: "24h",
        }
      );
      return res.status(200).json({
             message: "inicio de sesión con éxito!", 
             token ,
             success:true , 
             data: {
                ci: result.ci,
                nombre:result.nombre,
                telefono:result.telefono, 
                id_rol : result.idRol, 
                cargo: result.rol.cargo,
                } 
            });

    } catch (error) {
      return res.status(500).json({ message: error.message ,success:false}); // Internal Server Error
    }
  };
  