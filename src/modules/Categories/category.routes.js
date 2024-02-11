import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as categoryController from "./category.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";
import { endPointsRoles } from "./category.endpoint.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  addCategorySchema,
  deleteCategorySchema,
  updateCategorySchema,
} from "./category.validation-Schema.js";

const router = Router();

router.post(
  "/addCategory",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(addCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(categoryController.addCategory)
);

router.put(
  "/updateCategory/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(updateCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(categoryController.updateCategory)
);

router.delete(
  "/deleteCategory/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(deleteCategorySchema),
  expressAsyncHandler(categoryController.deleteCategory)
);

router.get(
  "/getAllCategory",
  expressAsyncHandler(categoryController.getAllCategory)
);

export default router;
