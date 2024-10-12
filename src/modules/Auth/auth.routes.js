import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as authController from "./auth.controller.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "./auth.Validation-Schema.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./Auth.endpoint.js";

const router = Router();

router.post(
  "/signup",
  validationMiddleware(validators.signUpSchema),
  expressAsyncHandler(authController.signUp)
);

router.get(
  "/verify-email",
  validationMiddleware(validators.verifyEmailSchema),
  expressAsyncHandler(authController.verifyEmail)
);

router.post(
  "/signin",
  validationMiddleware(validators.signInSchema),
  expressAsyncHandler(authController.login)
);

router.put(
  "/update",
  auth(endPointsRoles.ALL_USERS),
  // validationMiddleware(validators.updateUserSchema),
  expressAsyncHandler(authController.updateUser)
);

router.delete(
  "/delete",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.deleteUserSchema),
  expressAsyncHandler(authController.deleteUser)
);

router.get(
  "/getUserData",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.deleteUserSchema),
  expressAsyncHandler(authController.getUserData)
);

router.patch(
  "/updatepassword",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.updatePasswordSchema),
  expressAsyncHandler(authController.updatePassword)
);

router.patch(
  "/softDelete",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.softDeleteSchema),
  expressAsyncHandler(authController.softDelete)
);

router.post(
  "/forgetPassword",
  validationMiddleware(validators.forgetPasswordSchema),
  expressAsyncHandler(authController.forgetPassword)
);

router.post(
  "/resetPassword/:token",
  validationMiddleware(validators.resetPasswordSchema),
  expressAsyncHandler(authController.resetPassword)
);

export default router;
