import { CorsOptions } from 'cors';
import dotenv from "dotenv"
dotenv.config()

export const corsConfig: CorsOptions = {
   origin: (origin, callback) => {
      const whitelist = [process.env.FRONTEND_URL];
      if (process.argv[2] === '--api') {
         whitelist.push(undefined, null); // Permitir solicitudes sin origen (Postman, etc.)
      }
      if (!origin || whitelist.includes(origin)) {
         callback(null, true); // Permitir acceso
      } else {
         callback(new Error('Error de CORS'))
      }
   }
}
