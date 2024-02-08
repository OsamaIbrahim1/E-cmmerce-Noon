import { generalRules } from "../../utils/general.validation.rule.js";
import Joi from "joi";

export const addCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim(),
  }),
  headers: generalRules.headersRules,
};

export const updateCategorySchema = {
  body: Joi.object({
    name: Joi.string().trim(),
  }),
  params: Joi.object({ categoryId: generalRules.dbId }),
  headers: generalRules.headersRules,
};

export const deleteCategorySchema = {
  params: Joi.object({ categoryId: generalRules.dbId }),
  headers: generalRules.headersRules,
};
