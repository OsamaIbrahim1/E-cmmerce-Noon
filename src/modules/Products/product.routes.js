import { Router } from "express";

import * as productController from "./product.controller.js";
import expressAsyncHandler from "express-async-handler";
import { validationMiddleware } from "../../middlewares/validation.middleware.js";
import { multerMiddleHost } from "../../middlewares/multer.middleware.js";
import { allowedExtensions } from "../../utils/allowedExtentions.js";
import * as validators from "./product.Validation-Schema.js";
import { auth } from "../../middlewares/auth.middleware.js";
import { endPointsRoles } from "./product.endpoints-rule.js";

const router = Router();

router.post(
  "/addProduct",
  auth(endPointsRoles.ADD_PRODUCT),
  multerMiddleHost({ extensions: allowedExtensions.images }).array("image", 3),
  validationMiddleware(validators.addProductSchema),
  expressAsyncHandler(productController.addProduct)
);

router.put(
  "/updateProduct",
  auth(endPointsRoles.UPDATE_PRODUCT),
  validationMiddleware(validators.updateProductSchema),
  multerMiddleHost({ extensions: allowedExtensions.images }).single("image"),
  expressAsyncHandler(productController.updateProduct)
);

router.delete(
  "/deleteProduct",
  auth(endPointsRoles.DELETE_PRODUCT),
  validationMiddleware(validators.deleteProductSchema),
  expressAsyncHandler(productController.deleteProduct)
);

router.get(
  "/getProductById/:productId",
  validationMiddleware(validators.getProductByIdSchema),
  expressAsyncHandler(productController.getProductById)
);

router.get(
  "/searchWithAnyField",
  validationMiddleware(validators.searchWithAnyFieldSchema),
  expressAsyncHandler(productController.searchWithAnyField)
);

router.get(
  "/getProduct",
  auth(endPointsRoles.GET_PRODUCTS),
  expressAsyncHandler(productController.getProducts)
);

router.get(
  "/getAllProduct",
  auth(endPointsRoles.GET_PRODUCTS),
  expressAsyncHandler(productController.getAllProducts)
);

router.get(
  "/productsForTwoSpecificBrands",
  validationMiddleware(validators.productsForTwoSpecificBrandsSchema),
  expressAsyncHandler(productController.productsForTwoSpecificBrands)
);
router.get(
  "/productsForSpecificBrand/:brandId",
  auth(endPointsRoles.GET_PRODUCTS),
  expressAsyncHandler(productController.productsForSpecificBrand)
);
router.get(
  "/getProductsCategory/:categoryId",
  auth(endPointsRoles.GET_PRODUCTS),
  expressAsyncHandler(productController.getProductsCategory)
);

export default router;
