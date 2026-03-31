import mongoose from "mongoose";
const URL = process.env.MONGOURL;

const connectToDB = async () => {
  try {
    await mongoose.connect(URL);
    console.log("connected to DB");
  } catch (error) {
    console.log("error while connnecting to DB", error);
  }
};

export default connectToDB;
