import { z } from "zod";

export const registrarSalaSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  capacidad: z.number().min(1, "La capacidad debe ser al menos 1"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  esPrivada: z.boolean(),
  ciHost: z.string().min(5, "El CI del host es requerido"),
  diagrama: z.record(z.any()).default({}) // 👈 Se agrega el atributo diagrama con un JSON vacío por defecto
});
