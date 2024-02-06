import Joi from "joi";
import { systemRoles } from "../../utils/system-role.js";

export const signUpSchema = {
  body: Joi.object({
    username: Joi.string().min(3).max(20).trim().lowercase().required(),
    email: Joi.string().trim().lowercase().required().email(),
    password: Joi.string().min(6).required(),
    phoneNumbers: Joi.array().items(Joi.string().min(11).max(20).required()),
    addresses: Joi.array().items(Joi.string().required()),
    role: Joi.string()
      .valid(systemRoles.ADMIN, systemRoles.USER)
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
    password: Joi.string().min(6),
    phoneNumbers: Joi.array().items(Joi.string().min(11).max(20)),
    addresses: Joi.array().items(Joi.string()),
    role: Joi.string()
      .valid(systemRoles.ADMIN, systemRoles.USER)
      .default(systemRoles.USER),
    age: Joi.number().min(18).max(100),
  }),
  headers: Joi.object({
    accesstoken: Joi.string().required(),
    "postman-token": Joi.string(),
    "cache-control": Joi.string(),
    host: Joi.string(),
    "content-type": Joi.string(),
    "content-length": Joi.string(),
    "user-agent": Joi.string(),
    accept: Joi.string(),
    "accept-encoding": Joi.string(),
    connection: Joi.string(),
  }),
};

export const deleteUserSchema = {
  headers: Joi.object({
    accesstoken: Joi.string().required(),
    "postman-token": Joi.string(),
    "cache-control": Joi.string(),
    host: Joi.string(),
    "content-type": Joi.string(),
    "content-length": Joi.string(),
    "user-agent": Joi.string(),
    accept: Joi.string(),
    "accept-encoding": Joi.string(),
    connection: Joi.string(),
  }),
};
