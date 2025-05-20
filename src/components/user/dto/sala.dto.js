import { z } from "zod";

export const registrarUsuarioSchema = z.object({
  ci: z.string().min(5, "El CI es requerido"),
  nombre: z.string().min(1, "El nombre es requerido"),
  apellidos: z.string().min(1, "Los apellidos son requeridos"),
  correo: z.string().email("Correo no válido"),
  sexo: z.enum(["Masculino", "Femenino", "Otro"]),
  contrasena: z.string().min(6, "La contraseña debe tener mínimo 6 caracteres"),
  telefono: z.string().min(5, "El teléfono es requerido"),
  idRol: z.string().uuid("El ID del rol debe ser un UUID válido")
});
