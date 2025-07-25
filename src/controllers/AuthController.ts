import type { Request, Response } from "express"
import User from "../models/User"
import { checkPassword, hashPassword } from "../utils/auth"
import Token from "../models/Token"
import { generateToken } from "../utils/token"
import { AuthEmail } from "../emails/AuthEmail"
import { generateJWT } from "../utils/jwt"

export class AuthController {

   static createAccount = async (req: Request, res: Response) => {
      try {
         const { password, email } = req.body
         const userExists = await User.findOne({ email })
         if (userExists) {
            const error = new Error('El usuario ya esta registrado')
            res.status(409).json({ error: error.message })
            return
         }

         const user = new User(req.body)
         user.password = await hashPassword(password)

         const token = new Token()
         token.token = generateToken()
         token.user = user.id

         AuthEmail.sendConfirmationEmail({
            email: user.email,
            name: user.name,
            token: token.token
         })

         await Promise.allSettled([user.save(), token.save()])

         res.status(201).send('Cuenta creada, Revisa tu email para Confirmarla')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static confirmAccount = async (req: Request, res: Response) => {
      try {
         const { token } = req.body

         const tokenExists = await Token.findOne({ token })
         if (!tokenExists) {
            const error = new Error('Token no válido')
            res.status(404).json({ error: error.message })
            return
         }

         const user = await User.findById(tokenExists.user)
         user.confirmed = true

         await Promise.allSettled([user.save(), tokenExists.deleteOne()])

         res.status(200).send('Cuenta confirmada correctamente')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static login = async (req: Request, res: Response) => {
      try {
         const { email, password } = req.body
         const user = await User.findOne({ email })
         if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
         }

         if (!user.confirmed) {

            const token = new Token()
            token.user = user.id
            token.token = generateToken()
            await token.save()

            // Enviar Email
            AuthEmail.sendConfirmationEmail({
               email: user.email,
               name: user.name,
               token: token.token
            })

            const error = new Error('La cuenta no ha sido confirmada, hemos enviado un e-amil de confirmación')
            res.status(401).json({ error: error.message })
            return
         }

         // Reviasar Password
         const isPasswordCorrect = await checkPassword(password, user.password)
         if (!isPasswordCorrect) {
            const error = new Error('Password incorrecto')
            res.status(401).json({ error: error.message })
            return
         }

         const token = generateJWT({ id: user.id })

         res.status(200).send(token)
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static requestConfirmationCode = async (req: Request, res: Response) => {
      try {
         const { email } = req.body

         const user = await User.findOne({ email })
         if (!user) {
            const error = new Error('El usuario no esta registrado')
            res.status(404).json({ error: error.message })
            return
         }

         if (user.confirmed) {
            const error = new Error('El usuario ya esta confirmado')
            res.status(403).json({ error: error.message })
            return
         }

         const token = new Token()
         token.token = generateToken()
         token.user = user.id
         await token.save()

         AuthEmail.sendConfirmationEmail({
            email: user.email,
            name: user.name,
            token: token.token
         })

         res.status(201).send('Se envió un nuevo token a tu E-mail')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static forgotPassword = async (req: Request, res: Response) => {
      try {
         const { email } = req.body

         const user = await User.findOne({ email })
         if (!user) {
            const error = new Error('El usuario no esta registrado')
            res.status(404).json({ error: error.message })
            return
         }

         const token = new Token()
         token.token = generateToken()
         token.user = user.id
         await token.save()

         AuthEmail.sendPasswordResetEmail({
            email: user.email,
            name: user.name,
            token: token.token
         })

         res.status(201).send('Revisa tu E-mail para instrucciones')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static validateToken = async (req: Request, res: Response) => {
      try {
         const { token } = req.body

         const tokenExists = await Token.findOne({ token })
         if (!tokenExists) {
            const error = new Error('Token no válido')
            res.status(404).json({ error: error.message })
            return
         }
         res.status(200).send('Token válido, Define tu nueva Contraseña')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static updatePasswordWithToken = async (req: Request, res: Response) => {
      try {
         const { token } = req.params
         const { password } = req.body

         const tokenExists = await Token.findOne({ token })
         if (!tokenExists) {
            const error = new Error('Token no válido')
            res.status(404).json({ error: error.message })
            return
         }

         const user = await User.findById(tokenExists.user)
         user.password = await hashPassword(password)

         await Promise.allSettled([user.save(), tokenExists.deleteOne()])

         res.status(200).send('La contraseña se modificó correctamente')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static user = async (req: Request, res: Response) => {
      res.json(req.user)
      return
   }

   static updateProfile = async (req: Request, res: Response) => {

      const { name, email } = req.body

      const userExists = await User.findOne({ email })
      if (userExists && userExists.id.toString() !== req.user.id.toString()) {
         const error = new Error('El E-mail ya registrado')
         res.status(409).json({ error: error.message })
         return
      }

      req.user.name = name
      req.user.email = email

      try {
         await req.user.save()
         res.status(200).send('Perfil actualizado')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static updateCurrentUserPassword = async (req: Request, res: Response) => {

      const { current_password, password, password_confirmation } = req.body

      const user = await User.findById(req.user.id)
      const isPasswordCorrect = await checkPassword(current_password, user.password)
      if (!isPasswordCorrect) {
         const error = new Error('Password actual es incorrecto')
         res.status(401).json({ error: error.message })
         return
      }

      try {
         user.password = await hashPassword(password)
         await user.save()
         res.status(200).send('Password actualizado')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static checkPassword = async (req: Request, res: Response) => {

      const { password } = req.body

      const user = await User.findById(req.user.id)
      if (!user) {
         const error = new Error('Usuario no encontrado')
         res.status(404).json({ error: error.message })
         return
      }

      const isPasswordCorrect = await checkPassword(password, user.password)
      if (!isPasswordCorrect) {
         const error = new Error('Password es incorrecto')
         res.status(401).json({ error: error.message })
         return
      }

      try {
         res.status(200).send('Password correcto')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

}