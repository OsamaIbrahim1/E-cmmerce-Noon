import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../../DB/models/user.model.js";
import sendEmailService from "../services/send-email.service.js";
import Category from "../../../DB/models/category.model.js";
import SubCategories from "../../../DB/models/Sub-Category.model.js";
import Brand from "../../../DB/models/brand.model.js";
import generateUniqueString from "../../utils/generate-Unique-String.js";

//============================= signUp =============================//
/**
 * * destructure the required data from the request body
 * * check if the user already exists in the database using the email
 * * create token for the user
 * * send confirmation email to the user and check if sent
 * * hash password and check password is hashed
 * * create new document in the database
 * * response success
 */
export const signUp = async (req, res, next) => {
  // * destructure the required data from the request body
  const { username, email, password, phoneNumbers, addresses, role, age } =
    req.body;

  let phoneNumbersArray = [];
  let addressesArray = [];

  // * check if the user already exists in the database using the email
  const isEmailDuplicated = await User.findOne({ email });
  if (isEmailDuplicated) {
    return next(
      new Error(`Email already exists, Please try another email`, {
        cause: 409,
      })
    );
  }

  // * create token for the user
  const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERIFICATION, {
    expiresIn: "1h",
  });

  // * send confirmation email to the user and check if sent
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Verification",
    message: `
    <h2>Please click on this link to verify your email, yazezo</h2>
    <a href="${req.protocol}://${req.headers.host}/auth/verify-email?token=${usertoken}">Verify Email</a>`,
  });
  if (!isEmailSent)
    return next(
      new Error(`Email is not sent,please try again later`, { cause: 409 })
    );

  // * hash password and check password is hashed
  const hashedPassword = bcryptjs.hashSync(password, +process.env.SALT_ROUNDS);
  if (!hashedPassword) {
    return next(new Error(`password not hashed`, { cause: 404 }));
  }

  phoneNumbersArray.push(phoneNumbers);
  addressesArray.push(addresses);
  
  // * create new document in the database
  const objectUser = {
    username,
    email,
    password: hashedPassword,
    phoneNumbers: phoneNumbersArray,
    addresses: addressesArray,
    role,
    age,
  };
  const newUser = await User.create(objectUser);
  req.savedDocuments = { model: User, _id: newUser._id };
  if (!newUser) return next(new Error(`user not created`, { cause: 404 }));

  // * response success
  res.status(200).json({
    success: true,
    message: "User created successfully",
    data: newUser,
  });
};

//============================= Verify Email =============================//
/**
 * * destructure token from query and decode token
 * * get user by email , isEmailVerified  = false and update isEmailVerified = true
 * * response successfully
 */
export const verifyEmail = async (req, res, next) => {
  // * destructure token from query and decode token
  const { token } = req.query;
  const decodedData = jwt.verify(token, process.env.JWT_SECRET_VERIFICATION);

  // * get user by email , isEmailVerified  = false and update isEmailVerified = true
  const user = await User.findOneAndUpdate(
    { email: decodedData.email, isEmailVerified: false },
    { isEmailVerified: true },
    { new: true }
  );
  if (!user) return next(new Error(`user not found`, { cause: 404 }));

  // * response successfully
  res.status(201).json({
    success: true,
    message: "Email verified successfully,please try to login",
  });
};

//============================= Sign In =============================//
/**
 * * destructure data from body
 * * check if email already exists
 * * check if password matched
 * * generate token for user
 * * update islogged in = true
 * * response successfully
 */
export const login = async (req, res, next) => {
  // * destructure data from body
  const { email, password } = req.body;

  // * check if email already exists
  const user = await User.findOne({
    email,
    isEmailVerified: true,
    isDeleted: false,
  });

  if (!user) {
    return next(new Error(`Invalid login credentials`, { cause: 404 }));
  }

  // * check if password matched
  const passwordMatched = bcryptjs.compareSync(password, user.password);
  if (!passwordMatched) {
    return next(
      new Error(`Password mismatch, Please try again`, { cause: 404 })
    );
  }

  // * generate token for user
  const token = jwt.sign(
    { id: user._id, isloggedIn: true },
    process.env.JWT_SECRET_LOGIN,
    { expiresIn: "1d" }
  );

  // * update islogged in = true
  user.isloggedIn = true;
  user.token = token;
  await user.save();

  // * response successfully
  res.status(200).json({
    success: true,
    message: "logged in successfully",
    data: { token },
  });
};

//============================= update user =============================//
/**
 * * destructure the required data from the request body and request authUser
 * * check is user already exists
 * * if user wonts to update email
 * * update user and check if updated successfully
 * * response successfully
 */
export const updateUser = async (req, res, next) => {
  // * destructure the required data from the request body and request authUser
  const { username, email, phoneNumbers, addresses, role, age } = req.body;
  const { _id, oldEmail } = req.authUser;

  // * if user wonts to update email
  if (email) {
    if (oldEmail === email) {
      return next(
        new Error("this email is the same old email", { cause: 400 })
      );
    }
    const checkEmail = await User.findOne({ email });
    if (checkEmail) {
      return next(
        new Error("Email already exists,please enter another one.", {
          cause: 400,
        })
      );
    }
  }

  // * update user and check if updated successfully
  const userUpdated = await User.findByIdAndUpdate(
    { _id },
    { username, email, phoneNumbers, addresses, role, age },
    { new: true }
  );
  if (!userUpdated) return next(new Error("user not updated", { cause: 409 }));

  // * response successfully
  res.status(200).json({
    success: true,
    message: "updated successfully",
    userUpdated,
  });
};

//============================= delete user =============================//
/**
 * * destructure the user data from request headers
 * * find the user and delete them from the database
 * * response successfully
 */
export const deleteUser = async (req, res, next) => {
  // * destructure the user data from request headers
  const { _id } = req.authUser;

  // * find the user and delete them from the database
  const user = await User.findByIdAndDelete(_id);
  if (!user) {
    return next(new Error("User not found", { cause: 404 }));
  }

  // * delete subCategories and Brands
  const categories = await Category.find({ addedBy: _id });
  for (const category of categories) {
    await SubCategories.deleteMany({ categoryId: category._id });
    await Brand.deleteMany({ categoryId: category._id });
  }

  // * delete the category's user deleted
  const deleteCategory = await Category.deleteMany({ addedBy: _id });
  if (!deleteCategory) {
    return next(new Error("Category not deleted", { cause: 409 }));
  }
  // * response successfully
  res
    .status(200)
    .json({ success: true, message: "Successfully deleted", data: user });
};

//============================= get data user =============================//
/**
 * * destructure _id from authUser
 * * get user data
 * * response successfully
 */
export const getUserData = async (req, res, next) => {
  // * destructure _id from authUser
  const { _id } = req.authUser;

  // * get user data
  const user = await User.findById(_id).select(
    "-password -isEmailVerified -_id -isloggedIn"
  );
  if (!user) return next(new Error("user not found", { cause: 404 }));

  // * response successfully
  res.status(200).json({ success: true, message: "user data", data: user });
};

//================================== Update password =========================//
/**
 * * destructuring data from req.headers and req.body
 * * find account and compare password
 * * hash new Password and check if hashed
 * * update Password and check if updated
 * * response success
 */
export const updatePassword = async (req, res, next) => {
  // * destructuring data from req.body and req.headers
  const { password, newPassword } = req.body;
  const { _id } = req.authUser;

  // * find account and compare password
  const user = await User.findById(_id);
  const passwordMatched = bcryptjs.compareSync(password, user.password);
  if (!passwordMatched) {
    return next(
      new Error("password mismatch, Please Enter correct password", {
        cause: 400,
      })
    );
  }

  // * hash new Password and check if hashed
  const hashNewPassword = bcryptjs.hashSync(
    newPassword,
    +process.env.salts_number
  );
  if (!hashNewPassword)
    return next(new Error("new password not hashed", { cause: 400 }));

  // * update Password and check if updated
  user.password = hashNewPassword;
  user.save();

  // * response success
  res
    .status(200)
    .json({ success: true, message: "updated password", data: user });
};

//================================== soft Delete =========================//
/**
 * * destructure data from authUser
 * * update isDeleted from false to true
 * * response successfully
 */
export const softDelete = async (req, res, next) => {
  // * destructure data from authUser
  const { _id } = req.authUser;

  // * update isDeleted from false to true
  const user = await User.findByIdAndUpdate(_id, { isDeleted: true });

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: "deleted successfully", data: user });
};

//==================================  Forget password =========================//
/**
 * * destructure data from body
 * * get user by email
 * * generate reset password code
 * * hash code
 * * generate token to reset password
 * * send reset password email to the user and check if sent
 * * saved changes
 * * response successfully
 */
export const forgetPassword = async (req, res, next) => {
  // * destructure data from body
  const { email } = req.body;

  // * get user by email
  const user = await User.findOne({ email });
  if (!user) {
    return next("user not found", { cause: 404 });
  }

  // * generate reset password code
  const code = generateUniqueString(6);

  // * hash code
  const hashCode = bcryptjs.hashSync(code, +process.env.SALT_ROUNDS);

  // * generate token to reset password
  const token = jwt.sign(
    {
      email,
      forgetCode: hashCode,
    },
    process.env.RESET_Token,
    { expiresIn: "1h" }
  );

  const resetPasswordLink = `${req.protocol}://${req.headers.host}/auth/resetPassword/${token}`;

  // * send reset password email to the user and check if sent
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Reset Password",
    message: `
    <h2>Please click on this link to reset password</h2>
    <a href="${resetPasswordLink}">Verify Email</a>`,
  });
  if (!isEmailSent) {
    return next(`Email is not sent,please try again later`, { cause: 409 });
  }

  // * saved changes
  user.forgetCode = hashCode;
  await user.save();

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: `code sent successfully`, user });
};

//==================================  reset password =========================//
/**
 * * destructure data from params
 * * decoded token
 * * get user by email and code
 * * destructure data from body
 * * hash new password
 * * saved changes
 * * response successfully
 */
export const resetPassword = async (req, res, next) => {
  // * destructure data from params
  const { token } = req.params;

  // * decoded token
  const decoded = jwt.verify(token, process.env.RESET_Token);

  // * get user by email and code
  const user = await User.findOne({
    email: decoded?.email,
    forgetCode: decoded?.forgetCode,
  });
  if (!user) {
    return next("you already reset your password", { cause: 404 });
  }

  // * destructure data from body
  const { newPassword } = req.body;

  // * hash new password
  const newPasswordHash = bcryptjs.hashSync(
    newPassword,
    +process.env.SALT_ROUNDS
  );

  // * saved changes
  user.password = newPasswordHash;
  user.forgetCode = null;
  await user.save();

  // * response successfully
  res
    .status(200)
    .json({ success: true, message: `password changed successfully`, user });
};
