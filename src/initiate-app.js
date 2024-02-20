import db_connection from "../DB/connection.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";
import { rollbackSavedDocuments } from "./middlewares/rollback-saved-Documents.js";
import { rollbackUploadedFiles } from "./middlewares/rollback-uploaded-files.middleware.js";

import * as routers from "./modules/index.routes.js";

export const initiateApp = (app, express) => {
  const port = process.env.port;

  app.use(express.json());

  app.use("/auth", routers.userRouter);
  app.use("/category", routers.categoryRouter);
  app.use("/subCategory", routers.subCategoryRouter);
  app.use("/brand", routers.brandRouter);
  app.use("/product", routers.productRouter);
  app.use("/cart", routers.cartRouter);
  app.use(globalResponse, rollbackUploadedFiles, rollbackSavedDocuments);

  db_connection();
  app.listen(port, () => {
    console.log(`app listening on ${port}`);
  });
};
