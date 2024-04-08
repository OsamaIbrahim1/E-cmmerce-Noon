import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as subCategoryController from "./Sub-Categories.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";
import { endPointsRoles } from "./endpoints.Sub-Categories.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "./Sub-Categories.validation-Schema.js";

const router = Router();

router.post(
  "/addSubCategory/:categoryId",
  auth(endPointsRoles.ADD_SUBCATEGORY),
  validationMiddleware(validators.addSubCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(subCategoryController.addSubCategory)
);

router.put(
  "/updateSubCategory",
  auth(endPointsRoles.ADD_SUBCATEGORY),
  validationMiddleware(validators.updateSubCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(subCategoryController.updateSubCategory)
);

router.delete(
  "/deleteSubCategory",
  auth(endPointsRoles.ADD_SUBCATEGORY),
  validationMiddleware(validators.deleteSubCategorySchema),
  expressAsyncHandler(subCategoryController.deleteSubCategory)
);

router.get(
  "/getAllSubcategoriesWithBrands",
  expressAsyncHandler(subCategoryController.getAllSubcategoriesWithBrands)
);

router.get(
  "/getCategoryById/:SubCategoryId",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.getSubCategoryByIdSchema),
  expressAsyncHandler(subCategoryController.getSubCategoryById)
);

router.get(
  "/getAllBrands/:subCategoryId",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.getAllBrandsSchema),
  expressAsyncHandler(subCategoryController.getAllBrands)
);

router.get(
  "/getAllSubCategoriesWithPagination",
  expressAsyncHandler(subCategoryController.getAllSubCategoriesWithPagination)
);

export default router;
