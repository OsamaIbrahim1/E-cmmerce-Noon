import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as authController from "./auth.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  deleteUserSchema,
  signInSchema,
  signUpSchema,
  updateUserSchema,
  verifyEmailSchema,
} from "./auth.Validation-Schema.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./Auth.endpoint.js";

const router = Router();

router.post(
  "/signup",
  validationMiddleware(signUpSchema),
  expressAsyncHandler(authController.signUp)
);
router.get(
  "/verify-email",
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
  auth(endPointsRoles.UPDATE_AND_DELETE_USER),
  validationMiddleware(updateUserSchema),
  expressAsyncHandler(authController.updateUser)
);

router.delete(
  "/delete",
  auth(endPointsRoles.UPDATE_AND_DELETE_USER),
  validationMiddleware(deleteUserSchema),
  expressAsyncHandler(authController.deleteUser)
);

export default router;
