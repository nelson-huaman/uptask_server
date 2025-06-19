import { Router } from "express";
import { AuthController } from "../controllers/AuthController";
import { body, param } from "express-validator";
import { handleInputErrors } from "../middleware/validation";
import { autenticate } from "../middleware/auth";

const router = Router()

router.post('/create-account',
   body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
   body('email').isEmail().withMessage('E-mail no válido'),
   body('password').isLength({ min: 8 }).withMessage('el Password es muy corto, minimo 8 caracteres'),
   body('password_confirmation').custom((value, { req }) => {
      if (value !== req.body.password) {
         throw new Error('Los Password no son iguales')
      }
      return true
   }),
   handleInputErrors,
   AuthController.createAccount
)

router.post('/confirm-account',
   body('token').notEmpty().withMessage('El token no puede ir vacio'),
   handleInputErrors,
   AuthController.confirmAccount
)

router.post('/login',
   body('email').isEmail().withMessage('E-mail no válido'),
   body('password').notEmpty().withMessage('el Password no puede ir vacio'),
   handleInputErrors,
   AuthController.login
)

router.post('/request-code',
   body('email').isEmail().withMessage('E-mail no válido'),
   handleInputErrors,
   AuthController.requestConfirmationCode
)

router.post('/forgot-password',
   body('email').isEmail().withMessage('E-mail no válido'),
   handleInputErrors,
   AuthController.forgotPassword
)

router.post('/validate-token',
   body('token').notEmpty().withMessage('El token no puede ir vacio'),
   handleInputErrors,
   AuthController.validateToken
)

router.post('/update-token/:token',
   param('token').isNumeric().withMessage('El token no válido'),
   body('password').isLength({ min: 8 }).withMessage('el Password es muy corto, minimo 8 caracteres'),
   body('password_confirmation').custom((value, { req }) => {
      if (value !== req.body.password) {
         throw new Error('Los Password no son iguales')
      }
      return true
   }),
   handleInputErrors,
   AuthController.updatePasswordWithToken
)

router.get('/user',
   autenticate,
   AuthController.user
)

/** Profile */
router.put('/profile',
   autenticate,
   body('name').notEmpty().withMessage('El nombre no puede ir vacio'),
   body('email').isEmail().withMessage('E-mail no válido'),
   handleInputErrors,
   AuthController.updateProfile
)

router.post('/update-password',
   autenticate,
   body('current_password').notEmpty().withMessage('El password alcual no puede ir vacio'),
   body('password').isLength({ min: 8 }).withMessage('el Password es muy corto, minimo 8 caracteres'),
   body('password_confirmation').custom((value, { req }) => {
      if (value !== req.body.password) {
         throw new Error('Los Password no son iguales')
      }
      return true
   }),
   handleInputErrors,
   AuthController.updateCurrentUserPassword
)

router.post('/check-password',
   autenticate,
   body('password').notEmpty().withMessage('El password no puede ir vacio'),
   handleInputErrors,
   AuthController.checkPassword
)

export default router