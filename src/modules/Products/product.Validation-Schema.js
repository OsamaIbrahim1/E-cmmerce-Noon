import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addProductSchema = {
  body: Joi.object({
    title: Joi.string().required(),
    desc: Joi.string(),
    basePrice: Joi.number().required(),
    discount: Joi.number().default(0),
    stock: Joi.number().min(0).default(0).required(),
    specs: Joi.any(),
  }),
  query: Joi.object({
    categoryId: generalRules.dbId,
    subCategoryId: generalRules.dbId,
    brandId: generalRules.dbId,
  }),
  headers: generalRules.headersRules,
}; 

export const updateProductSchema = {
  body: Joi.object({
    title: Joi.string().trim(),
    desc: Joi.string(),
    slug: Joi.string(),
    basePrice: Joi.number(),
    discount: Joi.number(),
    appliedPrice: Joi.number(),
    stock: Joi.number().min(0),
    specs: Joi.array().items(
      Joi.array().length(2).ordered(
        Joi.string(), // Key
        Joi.string().alphanum() // Value
      )
    ),
  }),
  query: Joi.object({
    productId: generalRules.dbId,
  }),
  headers: generalRules.headersRules,
};

export const deleteProductSchema = {
  query: Joi.object({
    productId: generalRules.dbId,
  }),
  headers: generalRules.headersRules,
};
export const getProductByIdSchema = {
  query: Joi.object({
    productId: generalRules.dbId,
  }),
};

export const searchWithAnyFieldSchema = {
  body: Joi.object({
    title: Joi.string(),
    desc: Joi.string(),
    basePrice: Joi.number(),
    discount: Joi.number(),
    stock: Joi.number().min(0),
    specs: Joi.any(),
    appliedPrice: Joi.number(),
  }),
};

export const productsForTwoSpecificBrandsSchema = {
  body: Joi.object({ brand_1: generalRules.dbId, brand_2: generalRules.dbId }),
};
