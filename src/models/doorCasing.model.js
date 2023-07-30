import mongoose from "mongoose";

const { Schema } = mongoose;
const DoorCasing = new Schema(
  {
    style: {
      type: String,
      required: false,
    },
    doorType: {
      type: String,
      required: false,
    },
    height: {
      type: String,
      required: false,
    },
    size: {
      type: String,
      required: false,
    },
    rPrice: {
      type: Number,
      required: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("DoorCasing", DoorCasing);
