import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim(),
  }),
  params: Joi.object({ categoryId: generalRules.dbId }),
  // headers: generalRules.headersRules,
};

export const updateSubCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim(),
    oldPublicId: generalRules.dbId,
  }),
  query: Joi.object({ subCategoryId: generalRules.dbId }),
  // // headers: generalRules.headersRules,
};
export const deleteSubCategorySchema = {
  query: Joi.object({ subCategoryId: generalRules.dbId }),
  // // headers: generalRules.headersRules,
};

export const getSubCategoryByIdSchema = {
  params: Joi.object({ SubCategoryId: generalRules.dbId }),
  // // headers: generalRules.headersRules,
};

export const getAllBrandsSchema = {
  params: Joi.object({ subCategoryId: generalRules.dbId }),
  // // headers: generalRules.headersRules,
};
