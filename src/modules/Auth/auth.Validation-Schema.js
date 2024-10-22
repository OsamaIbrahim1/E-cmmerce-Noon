import Joi from "joi";
import { systemRoles } from "../../utils/system-role.js";
import { generalRules } from "../../utils/general.validation.rule.js";

export const signUpSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(20).trim().lowercase().required(),
    email: Joi.string().trim().lowercase().required().email(),
    password: Joi.string().min(6).required(),
    phoneNumber: Joi.string().min(11).max(20).required(),
    address: Joi.string().required(),
    role: Joi.string()
      .valid(systemRoles.ADMIN, systemRoles.USER, systemRoles.SUPER_ADMIN)
      .default(systemRoles.USER),
    age: Joi.number().min(18).max(100).required(),
  }),
};

export const verifyEmailSchema = {
  query: Joi.object({
    token: Joi.string().required(),
  }),
};

export const signInSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().required().email(),
    password: Joi.string().min(6).required(),
  }),
};

export const updateUserSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(20).trim().lowercase(),
    email: Joi.string().trim().lowercase().email(),
    // password: Joi.string().min(6),
    phoneNumbers: Joi.string().min(11).max(20),
    address: Joi.string(),
    age: Joi.number().min(18).max(100),
  }),
};

export const updatePasswordSchema = {
  body: Joi.object({
    password: Joi.string().min(6).max(15).required(),
    newPassword: Joi.string().min(6).max(15).required(),
  }),
};

export const forgetPasswordSchema = {
  body: Joi.object({
    email: Joi.string().trim().lowercase().required().email(),
  }),
};

export const resetPasswordSchema = {
  body: Joi.object({
    newPassword: Joi.string().min(6).required(),
  }),
  params: Joi.object({
    token: Joi.string().required(),
  }),
};
