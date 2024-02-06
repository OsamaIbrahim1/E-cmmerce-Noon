import { Router } from "express";
import * as authController from "./auth.controller.js";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  deleteUserSchema,
  signInSchema,
  signUpSchema,
  updateUserSchema,
  verifyEmailSchema,
} from "./Validation-Schema.auth.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { systemRoles } from "../../utils/system-role.js";

const router = Router();

router.post(
  "/signup",
  validationMiddleware(signUpSchema),
  expressAsyncHandler(authController.signUp)
);
router.get(
  "/verify-email",
  auth(systemRoles.ADMIN, systemRoles.USER),
  validationMiddleware(verifyEmailSchema),
  expressAsyncHandler(authController.verifyEmail)
);

router.post(
  "/signin",
  validationMiddleware(signInSchema),
  expressAsyncHandler(authController.login)
);

router.put(
  "/update",
  auth([systemRoles.ADMIN, systemRoles.USER]),
  validationMiddleware(updateUserSchema),
  expressAsyncHandler(authController.updateUser)
);

router.delete(
  "/delete",
  auth([systemRoles.ADMIN, systemRoles.USER]),
  validationMiddleware(deleteUserSchema),
  expressAsyncHandler(authController.deleteUser)
);

export default router;
