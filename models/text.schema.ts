import { Schema } from "mongoose";

// Reusable text field schema
const TextSchema = new Schema(
  {
    text: String,
  },
  { _id: false }
); // _id: false to avoid creating an extra _id for each text schema

export default TextSchema;
