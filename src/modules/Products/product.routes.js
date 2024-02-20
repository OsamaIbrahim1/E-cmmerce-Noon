import { Router } from "express";

import * as productController from "./product.Controller.js";
import expressAsyncHandler from "express-async-handler";
import { systemRoles } from "../../utils/system-role.js";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";
import {
  addProductSchema,
  deleteProductSchema,
  getProductByIdSchema,
  productsForTwoSpecificBrandsSchema,
  searchWithAnyFieldSchema,
  updateProductSchema,
} from "./product.Validation-Schema.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./product.endpoints-rule.js";

const router = Router();

router.post(
  "/addProduct",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({ extensions: allowedExtensions.images }).array("image", 3),
  validationMiddleware(addProductSchema),
  expressAsyncHandler(productController.addProduct)
);

router.put(
  "/updateProduct",
  auth(endPointsRoles.UPDATE_PRODUCT),
  validationMiddleware(updateProductSchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(productController.updateProduct)
);

router.delete(
  "/deleteProduct",
  auth(endPointsRoles.DELETE_PRODUCT),
  validationMiddleware(deleteProductSchema),
  expressAsyncHandler(productController.deleteProduct)
);

router.get(
  "/getProductById",
  validationMiddleware(getProductByIdSchema),
  expressAsyncHandler(productController.getProductById)
);

router.get(
  "/searchWithAnyField",
  validationMiddleware(searchWithAnyFieldSchema),
  expressAsyncHandler(productController.searchWithAnyField)
);

router.get(
  "/getAllProduct",
  expressAsyncHandler(productController.getAllProducts)
);

router.get(
  "/productsForTwoSpecificBrands",
  validationMiddleware(productsForTwoSpecificBrandsSchema),
  expressAsyncHandler(productController.productsForTwoSpecificBrands)
);

export default router;
