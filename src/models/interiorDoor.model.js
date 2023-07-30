const mongoose = require("mongoose");

const { Schema } = mongoose;
const interiorDoorStyleSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: Schema.Types.ObjectId,
    ref: "Service",
    required: true,
  },
  image: {
    type: String,
    required: false
  },
  modelName: {
    type: String,
    required: true,
  },
  room: {
    type: String,
    required: false,
  },
  floor: {
    type: String,
    required: false,
  },
  grid: {
    type: String,
    required: false,
  },
  doorType: {
    type: String,
    required: false,
  },
  openDirection: {
    type: String,
    required: false,
  },
  size: {
    type: String,
    required: false,
  },
  color: {
    type: String,
    required: false,
  },
  lockAndKey: {
    type: String,
    required: false
  },
  wallConditionJambWidth: {
    type: String,
    required: true,
  },
  jambWidthInches: {
    type: Number,
    required: true,
  },
  doorWidth: {
    type: String,
    required: true,
  },
  doorWidthInches: {
    type: Number,
    required: true,
  },
  doorHeight: {
    type: String,
    required: true,
  },
  doorHeightInches: {
    type: Number,
    required: true,
  },
  unit: {
    type: String,
    required: true,
  },
  overallFrameWidth: {
    type: Number,
    required: true,
  },
  overallFrameHeight: {
    type: Number,
    required: true,
  },
  surface: {
    type: String,
    required: true,
  },
  thicknessAndCore: {
    type: String,
    required: true,
  },
  doorThickness: {
    type: String,
    required: true,
  },
  coreType: {
    type: String,
    required: true,
  },
  doorThicknessInches: {
    type: Number,
    required: true,
  },
  hinges: {
    type: Number,
    required: true,
  },  
  isFireRated: {
    type: Boolean,
    required: true,
  },
  rsPrice: {
    type: Number,
    required: true,
  },
});


export default mongoose.model("InteriorDoorStyle", interiorDoorStyleSchema);
