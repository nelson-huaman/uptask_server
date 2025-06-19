import type { Request, Response } from "express"
import Project from "../models/Project"

export class ProjectController {

   static createProject = async (req: Request, res: Response) => {
      try {
         const project = new Project(req.body)

         project.manager = req.user.id

         await project.save()
         res.status(201).send('Proyecto Creado')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static getAllProjects = async (req: Request, res: Response) => {
      try {
         const projects = await Project.find({
            $or: [
               { manager: { $in: req.user.id } },
               { team: { $in: req.user.id } }
            ]
         })
         res.status(200).json(projects)
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static getProjectById = async (req: Request, res: Response) => {
      try {

         const { id } = req.params
         const project = await Project.findById(id).populate('tasks')
         if (!project) {
            const error = new Error('Proyecto no encotrado')
            res.status(404).json({ error: error.message })
            return
         }

         if (project.manager.toString() !== req.user.id.toString() && !project.team.includes(req.user.id)) {
            const error = new Error('Ación no válida')
            res.status(404).json({ error: error.message })
            return
         }

         res.status(200).json(project)
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static updateProject = async (req: Request, res: Response) => {
      try {
         req.project.projectName = req.body.projectName
         req.project.clientName = req.body.clientName
         req.project.description = req.body.description
         await req.project.save()
         res.send('Proyecto Actualizado')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static deleteProject = async (req: Request, res: Response) => {
      try {
         await req.project.deleteOne()
         res.send('Proyecto Eliminado')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

}