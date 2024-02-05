import jwt from "jsonwebtoken";

export const auth = (accessRole) => {
  return async (req, res, next) => {
    try {
      const { accesstoken } = req.headers;
      if (!accesstoken)
        return next(new Error(`please login first`, { cause: 400 }));

      if (!accesstoken.startsWith(process.env.prefix_token))
        return next(new Error(`invalid token prefix`, { cause: 400 }));

      const token = accesstoken.split(process.env.prefix_token)[1];
      const decodedData = jwt.verify(token, process.env.private_kew);
      if (!decodedData || !decodedData.id)
        return next(new Error(`invalid token payload`, { cause: 400 }));

      // check user
      const findUser = await User.findById(
        decodedData._id,
        "username email role"
      );
      if (!findUser)
        return next(new Error(`please SignUp first`, { cause: 404 }));

      //authorization
      if (!accessRole.includes(decodedData.role))
        return next(new Error(`unauthorized`, { cause: 401 }));
      req.authUser = findUser;
      next();
    } catch (err) {
      next(new Error("catch error in auth middleware", { cause: 500 }));
    }
  };
};
