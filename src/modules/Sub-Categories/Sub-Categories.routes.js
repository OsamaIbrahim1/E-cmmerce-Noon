import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as subCategoryController from "./Sub-Categories.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";
import { endPointsRoles } from "./endpoints.Sub-Categories.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import {
  addSubCategorySchema,
  updateSubCategorySchema,
} from "./Sub-Categories.validation-Schema.js";
import { deleteCategorySchema } from "../Categories/category.validation-Schema.js";

const router = Router();

router.post(
  "/addSubCategory/:categoryId",
  auth(endPointsRoles.ADD_SUBCATEGORY),
  validationMiddleware(addSubCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(subCategoryController.addSubCategory)
);

router.put(
  "/updateSubCategory",
  auth(endPointsRoles.ADD_SUBCATEGORY),
  validationMiddleware(updateSubCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(subCategoryController.updateSubCategory)
);

router.delete(
  "/deleteSubCategory",
  auth(endPointsRoles.ADD_SUBCATEGORY),
  validationMiddleware(deleteCategorySchema),
  expressAsyncHandler(subCategoryController.deleteSubCategory)
);
router.get(
  "/getAllSubcategoriesWithBrands",
  expressAsyncHandler(subCategoryController.getAllSubcategoriesWithBrands)
);

export default router;
