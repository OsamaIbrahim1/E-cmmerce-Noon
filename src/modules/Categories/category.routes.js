import { Router } from "express";
import expressAsyncHandler from "express-async-handler";

import * as categoryController from "./category.controller.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";
import { endPointsRoles } from "./category.endpoint-rule.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import * as validators from "./category.validation-Schema.js";

const router = Router();

router.post(
  "/addCategory",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(validators.addCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(categoryController.addCategory)
);

router.put(
  "/updateCategory/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(validators.updateCategorySchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(categoryController.updateCategory)
);

router.delete(
  "/deleteCategory/:categoryId",
  auth(endPointsRoles.ADD_CATEGORY),
  validationMiddleware(validators.deleteCategorySchema),
  expressAsyncHandler(categoryController.deleteCategory)
);

router.get(
  "/categories",
  auth(endPointsRoles.ALL_USERS),
  expressAsyncHandler(categoryController.getCategories)
);

router.get(
  "/getAllCategoryWithSubCategoryWithBrand",
  auth(endPointsRoles.ALL_USERS),
  expressAsyncHandler(categoryController.getAllCategoryWithSubCategoryWithBrand)
);

router.get("/getAllData", expressAsyncHandler(categoryController.getAllData));

router.get(
  "/getAllSubCategories",
  auth(endPointsRoles.Get_All_SubCategories),
  validationMiddleware(validators.getAllSubCategoriesSchema),
  expressAsyncHandler(categoryController.getAllSubCategories)
);

router.get(
  "/getCategoryById/:categoryId",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.getCategoryByIdSchema),
  expressAsyncHandler(categoryController.getCategoryById)
);

router.get(
  "/getAllBrandForCategory/:categoryId",
  auth(endPointsRoles.ALL_USERS),
  validationMiddleware(validators.getAllBrandForCategorySchema),
  expressAsyncHandler(categoryController.getAllBrandForCategory)
);

router.get(
  "/getAllCategoryWithPagination",
  expressAsyncHandler(categoryController.getAllCategoryWithPagination)
);

export default router;
