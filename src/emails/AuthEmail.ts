import { transporter } from "../config/nodemailer"

interface IEmail {
   email: string
   name: string
   token: string
}

export class AuthEmail {

   static sendConfirmationEmail = async (user: IEmail) => {
      const info = await transporter.sendMail({
         from: 'UpTask <admin@uptask.com>',
         to: user.email,
         subject: 'UpTask - Confirma tu Cuenta',
         text: 'UpTask - Confirma tu Cuenta',
         html: `
            <p>Hola: ${user.name}, has creado tu cuenta en UpTask, ya casi esta todo listo, solo confirma tu cuenta</p>
            <p>VIsita el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/auth/confirm-account">Confirmar Cuenta</a>
            <p>Ingresa el Código: <b>${user.token}</b></p>
            <p>Este token expira en 2 minutos</p>
         `
      })
      console.log('Mensaje enviado', info.messageId);
   }

   static sendPasswordResetEmail = async (user: IEmail) => {
      const info = await transporter.sendMail({
         from: 'UpTask <admin@uptask.com>',
         to: user.email,
         subject: 'UpTask - Reestablece tu password',
         text: 'UpTask - Reestablece tu password',
         html: `
            <p>Hola: ${user.name}, has solicitado restablecer tu password.</p>
            <p>VIsita el siguiente enlace</p>
            <a href="${process.env.FRONTEND_URL}/auth/new-password">Reestablecer Password</a>
            <p>Ingresa el Código: <b>${user.token}</b></p>
            <p>Este token expira en 2 minutos</p>
         `
      })
      console.log('Mensaje enviado', info.messageId);
   }
}