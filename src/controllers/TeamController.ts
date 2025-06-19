import type { Request, Response } from "express";
import User from "../models/User";
import Project from "../models/Project";

export class TeamMemberController {

   static findMemberByEmail = async (req: Request, res: Response) => {
      try {
         const { email } = req.body

         const user = await User.findOne({ email }).select('id email name')
         if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
         }
         res.status(200).json(user)
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static getProjectTeam = async (req: Request, res: Response) => {
      try {
         const project = await Project.findById(req.project.id).populate({
            path: 'team',
            select: 'id email name'
         })
         res.status(200).json(project.team)
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }


   static addMemberById = async (req: Request, res: Response) => {
      try {
         const { id } = req.body

         const user = await User.findById(id).select('id')
         if (!user) {
            const error = new Error('Usuario no encontrado')
            res.status(404).json({ error: error.message })
            return
         }

         if (req.project.team.some(team => team.toString() === user.id.toString())) {
            const error = new Error('Usuario ya existe en el Proyecto')
            res.status(409).json({ error: error.message })
            return
         }

         req.project.team.push(user.id)
         await req.project.save()

         res.status(200).send('Usuario agregado')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static removeMemberById = async (req: Request, res: Response) => {
      try {
         const { userId } = req.params

         if (!req.project.team.some(team => team.toString() === userId)) {
            const error = new Error('Usuario no existe en el Proyecto')
            res.status(409).json({ error: error.message })
            return
         }

         req.project.team = req.project.team.filter(temaMember => temaMember.toString() !== userId)
         await req.project.save()

         res.status(200).send('Usuario eliminado')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }
}