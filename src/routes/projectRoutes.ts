import { Router } from "express";
import { ProjectController } from "../controllers/ProjectController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { TaskController } from "../controllers/TaskControllres";
import { projectExists } from "../middleware/project";
import { hasAuthorization, taskBelongsToProject, taskExists } from "../middleware/task";
import { autenticate } from "../middleware/auth";
import { TeamMemberController } from "../controllers/TeamController";
import { NoteController } from "../controllers/NoteCotroller";

const router = Router()

router.use(autenticate)

router.post('/',
   body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
   body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
   body('description').notEmpty().withMessage('La Descripción del Proyecto es Obligatorio'),
   handleInputErrors,
   ProjectController.createProject
)

router.get('/',
   ProjectController.getAllProjects
)


router.get('/:id',
   param('id').isMongoId().withMessage('ID no válido'),
   handleInputErrors,
   ProjectController.getProjectById
)

router.param('projectId', projectExists)

router.put('/:projectId',
   hasAuthorization,
   param('projectId').isMongoId().withMessage('ID no válido'),
   body('projectName').notEmpty().withMessage('El Nombre del Proyecto es Obligatorio'),
   body('clientName').notEmpty().withMessage('El Nombre del Cliente es Obligatorio'),
   body('description').notEmpty().withMessage('La Descripción del Proyecto es Obligatorio'),
   handleInputErrors,
   ProjectController.updateProject
)

router.delete('/:projectId',
   hasAuthorization,
   param('projectId').isMongoId().withMessage('ID no válido'),
   handleInputErrors,
   ProjectController.deleteProject
)



router.post('/:projectId/tasks',
   hasAuthorization,
   body('name').notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
   body('description').notEmpty().withMessage('La Descripción de la Tarea es Obligatorio'),
   handleInputErrors,
   TaskController.createTask
)

router.get('/:projectId/tasks',
   TaskController.getProjectTasks
)

router.param('taskId', taskExists)
router.param('taskId', taskBelongsToProject)

router.get('/:projectId/tasks/:taskId',
   param('taskId').isMongoId().withMessage('ID no válido'),
   handleInputErrors,
   TaskController.getTaskById
)

router.put('/:projectId/tasks/:taskId',
   hasAuthorization,
   param('taskId').isMongoId().withMessage('ID no válido'),
   body('name').notEmpty().withMessage('El Nombre de la Tarea es Obligatorio'),
   body('description').notEmpty().withMessage('La Descripción de la Tarea es Obligatorio'),
   handleInputErrors,
   TaskController.updateTask
)

router.delete('/:projectId/tasks/:taskId',
   hasAuthorization,
   param('taskId').isMongoId().withMessage('ID no válido'),
   handleInputErrors,
   TaskController.deleteTask
)

router.post('/:projectId/tasks/:taskId/status',
   param('taskId').isMongoId().withMessage('ID no válido'),
   body('status').notEmpty().withMessage('El Estado es Oblogatorio'),
   handleInputErrors,
   TaskController.updateStatus
)

router.post('/:projectId/team/find',
   body('email').isEmail().toLowerCase().withMessage('E-mail no válido'),
   handleInputErrors,
   TeamMemberController.findMemberByEmail
)

router.get('/:projectId/team',
   TeamMemberController.getProjectTeam
)

router.post('/:projectId/team',
   body('id').isMongoId().withMessage('ID no válido'),
   handleInputErrors,
   TeamMemberController.addMemberById
)

router.delete('/:projectId/team/:userId',
   param('userId').isMongoId().withMessage('ID no válido'),
   handleInputErrors,
   TeamMemberController.removeMemberById
)

/** Routes for Note */
router.post('/:projectId/tasks/:taskId/notes',
   body('content').notEmpty().withMessage('El contenido es obligatorio'),
   handleInputErrors,
   NoteController.createNote
)

router.get('/:projectId/tasks/:taskId/notes',
   NoteController.getTaskNotes
)

router.delete('/:projectId/tasks/:taskId/notes/:nodeId',
   param('nodeId').isMongoId().withMessage('ID no válido'),
   handleInputErrors,
   NoteController.deleteNote
)


export default router