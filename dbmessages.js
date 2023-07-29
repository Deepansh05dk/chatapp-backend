import mongoose from "mongoose";

const whatsappschema = mongoose.Schema({
  message: String,
  name: String,
  timestamp: String,
});

export default mongoose.model("messagecontent", whatsappschema);
