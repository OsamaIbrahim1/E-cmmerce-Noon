import bcryptjs from "bcryptjs";
import jwt from "jsonwebtoken";

import User from "../../../DB/models/user.model.js";
import sendEmailService from "../services/send-email.service.js";

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

  // * check if the user already exists in the database using the email
  const isEmailDuplicated = await User.findOne({ email });
  if (isEmailDuplicated)
    return next(
      new Error(`Email already exists, Please try another email`, {
        cause: 409,
      })
    );

  // * create token for the user
  const usertoken = jwt.sign({ email }, process.env.JWT_SECRET_VERIFICATION, {
    expiresIn: "1h",
  });

  // * send confirmation email to the user and check if sent
  const isEmailSent = await sendEmailService({
    to: email,
    subject: "Email Verification",
    message: `
    <h2>Please click on this link to verify your email</h2>
    <a href="http://localhost:3000/auth/verify-email?token=${usertoken}">Verify Email</a>`,
  });
  if (!isEmailSent)
    return next(
      new Error(`Email is not sent,please try again later`, { cause: 409 })
    );

  // * hash password and check password is hashed
  const hashedPassword = bcryptjs.hashSync(password, +process.env.SALT_ROUNDS);
  if (!hashedPassword)
    return next(new Error(`password not hashed`, { cause: 400 }));

  // * create new document in the database
  const newUser = await User.create({
    username,
    email,
    password: hashedPassword,
    phoneNumbers,
    addresses,
    role,
    age,
  });
  if (!newUser) return next(new Error(`user not created`, { cause: 400 }));

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
  res.status(200).json({
    success: true,
    message: "Email verified successfully,please try to login",
  });
};

//============================= Sign In =============================//
/**
 * * destructure data from body
 */

export const login = async (req, res, next) => {
  // * destructure data from body
  const { email, password } = req.body;

  // * check if email already exists
  const user = await User.findOne({ email, isEmailVerified: true });
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
    { email: user.email, id: user._id, isloggedIn: true },
    process.env.JWT_SECRET_LOGIN,
    { expiresIn: "1d" }
  );

  // * update islogged in = true
  user.isloggedIn = true;
  user.save();
};
