import mongoose from "mongoose";

const db_connection = async () => {
  await mongoose
    .connect(process.env.CONNECTION_URL_HOST)
    .then(() => {
      console.log("Successfully Connection");
    })
    .catch((err) => {
      console.log("Connection error: " + err);
    });
};
export default db_connection;
