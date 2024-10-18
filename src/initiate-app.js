import db_connection from "../DB/connection.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollbackSavedDocuments } from "./middlewares/rollback-saved-Documents.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middleware.js";
import { gracefulShutdown } from "node-schedule";
import cors from "cors";
import * as routers from "./modules/index.routes.js";
import { cronToChangeExpiredCoupons } from "./utils/crons.js";
import { corsOptions } from "./utils/cors.js";

export const initiateApp = (app, express) => {
  const port = +process.env.port || 3000;

  app.use(express.json());

  app.use(cors(corsOptions));


  app.use("/auth", routers.userRouter);
  app.use("/category", routers.categoryRouter);
  app.use("/subCategory", routers.subCategoryRouter);
  app.use("/brand", routers.brandRouter);
  app.use("/product", routers.productRouter);
  app.use("/cart", routers.cartRouter);
  app.use("/coupon", routers.couponRouter);
  app.use("/order", routers.orderRouter);
  app.use("/review", routers.reviewRouter);

  app.use("*", (req, res, next) => {
    res.status(404).json({ message: "Not Found" });
  });

  app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments);

  db_connection();
  gracefulShutdown();
  cronToChangeExpiredCoupons();
  app.listen(port, () => {
    console.log(`app listening on ${port}`);
  });
};
