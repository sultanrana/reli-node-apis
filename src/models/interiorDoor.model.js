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
  modelName: {
    type: String,
    required: true,
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

// const InteriorDoorStyle = mongoose.model("InteriorDoorStyle", interiorDoorStyleSchema);

// module.exports = InteriorDoorStyle;

export default mongoose.model("InteriorDoorStyle", interiorDoorStyleSchema);
