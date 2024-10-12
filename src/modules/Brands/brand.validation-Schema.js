import Joi from "joi";
import { generalRules } from "../../utils/general.validation.rule.js";

export const addBrandSchema = {
  body: Joi.object({
    name: Joi.string().trim(),
  }),
  query: Joi.object({
    categoryId: generalRules.dbId,
    subCategoryId: generalRules.dbId,
  }),
  // headers: generalRules.headersRules,
};
export const deleteBrandSchema = {
  params: Joi.object({
    brandId: generalRules.dbId,
  }),
  // headers: generalRules.headersRules,
};

export const updateBrandSchema = {
  body: Joi.object({
    name: Joi.string().trim(),
    oldPublicId: generalRules.dbId,
  }),
  query: Joi.object({
    brandId: generalRules.dbId,
  }),
  // headers: generalRules.headersRules,
};
