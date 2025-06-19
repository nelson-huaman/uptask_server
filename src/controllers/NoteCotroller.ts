import type { Request, Response } from "express"
import Note, { INote } from "../models/Note";
import { Types } from "mongoose";

type NoteParams = {
   nodeId: Types.ObjectId
}

export class NoteController {

   static createNote = async (req: Request<{}, {}, INote>, res: Response) => {
      const { content } = req.body
      const note = new Note()
      note.content = content
      note.createdBy = req.user.id
      note.task = req.task.id

      req.task.notes.push(note.id)

      try {
         await Promise.allSettled([req.task.save(), note.save()])
         res.status(201).send('Tarea creada')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static getTaskNotes = async (req: Request, res: Response) => {
      try {
         const notes = await Note.find({ task: req.task.id })
         res.status(200).json(notes)
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }

   static deleteNote = async (req: Request<NoteParams>, res: Response) => {
      const { nodeId } = req.params
      const note = await Note.findById(nodeId)
      
      if (!note) {
         const error = new Error('Nota no encontrada')
         res.status(404).json({ error: error.message })
         return
      }
      
      if (note.createdBy.toString() !== req.user.id.toString()) {
         const error = new Error('Acción no válida')
         res.status(409).json({ error: error.message })
         return
      }

      req.task.notes = req.task.notes.filter(note => note.toString() !== nodeId.toString())

      try {
         await Promise.allSettled([req.task.save(), note.deleteOne()])
         res.status(200).send('Nota Eliminada')
      } catch (error) {
         res.status(500).json({ error: 'Hubo un Error' })
      }
   }
}