import db_connection from "../DB/connection.js";
import { globalResponse } from "./middlewares/global-response.middleware.js";

import * as routers from "./modules/index.routes.js";

export const initiateApp = (app, express) => {
  const port = process.env.port;

  app.use(express.json());

  app.use("/auth", routers.userRouter);
  app.use("/category", routers.categoryRouter);
  app.use(globalResponse);

  db_connection();
  app.listen(port, () => {
    console.log(`app listening on ${port}`);
  });
};
