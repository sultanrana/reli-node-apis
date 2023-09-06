import mongoose from 'mongoose';

const { Schema } = mongoose;
const OrderDetail = new Schema(
  {
    order: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    service: {
      type: Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    serviceName: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      required: false,
    },
    serviceType: {
      type: String,
      default: null,
    },
    property: {
      type: Schema.Types.ObjectId,
      ref: 'Property',
      required: true,
    },
    handling: {
      type: String,
      required: false,
    },
    roomType: {
      type: String,
      default: null,
    },
    gridSelection: {
      type: String,
      required: false,
    },
    doorType: {
      type: String,
      required: false,
    },
    doorSize: {
      type: String,
      required: false,
    },
    lockAndKey: {
      type: Boolean,
      required: false,
    },
    distanceFromGround: {
      type: String,
      default: null,
    },
    floorType: {
      type: String,
      default: null,
    },
    sTiles: {
      type: String,
      required: false,
    },
    sticking: {
      type: String,
      required: false,
    },
    measureType: {
      type: String,
      default: null,
    },
    width: {
      type: Number,
      default: null,
    },
    height: {
      type: Number,
      default: null,
    },
    currectMeasurement: {
      type: Boolean,
      default: false,
    },
    images: [
      {
        type: String,
        default: null,
      },
    ],
    temperedGlassType: {
      type: String,
      default: null,
    },
    glassType: {
      type: String,
      default: null,
    },
    borePrep: {
      type: String,
      required: false,
    },
    bevel: {
      type: String,
      required: false,
    },
    interiorHardware: {
      type: String,
      required: false,
    },
    preHanging: {
      type: String,
      required: false,
    },
    wallCondition: {
      type: String,
      required: false,
    },
    carpetCut: {
      type: String,
      required: false,
    },
    stopType: {
      type: String,
      required: false,
    },
    bullNose: {
      type: String,
      required: false,
    },
    astragal: {
      type: String,
      required: false,
    },
    flushBolts: {
      type: String,
      required: false,
    },
    designType: {
      type: String,
      default: null,
    },
    colorSelection: {
      type: String,
      default: null,
    },
    color: {
      type: String,
      default: null,
    },
    styleSelection: {
      type: String,
      default: null,
    },
    openingType: {
      type: String,
      default: null,
    },
    openingDirection: {
      type: String,
      default: null,
    },
    totalAmount: {
      type: Number,
      default: null,
    },
    statusBit: {
      type: Boolean,
      default: true,
    },
    delBit: {
      type: Boolean,
      default: false,
    },
    modelName: {
      type: String,
      required: false,
      default: null,
    },
    jambWidthInches: {
      type: String,
      required: false,
      default: null,
    },
    units: {
      type: String,
      required: false,
      default: null,
    },
    unit: {
      type: String,
      required: false,
      default: null,
    },
    stackedWindow: {
      type: String,
      required: false,
      default: null,
    },
    windowType: {
      type: String,
      required: false,
      default: null,
    },
    overallFrameWidth: {
      type: String,
      required: false,
      default: null,
    },
    overallFrameHeight: {
      type: String,
      required: false,
      default: null,
    },
    coreType: {
      type: String,
      default: null,
      required: false,
    },
    doorThicknessInches: {
      type: Number,
      required: false,
      default: null,
    },
    hinges: {
      type: String,
      required: false,
      default: null,
    },
    hingeType: {
      type: String,
      required: false,
    },
    hingeFinish: {
      type: String,
      required: false,
    },
    ballBearingHinges: {
      type: String,
      required: false,
    },
    openInGarage: {
      type: Boolean,
      required: false,
      default: null,
    },
    isFireRated: {
      type: Boolean,
      required: false,
      default: null,
    },
    core: {
      type: String,
      required: false,
      default: null,
    },
    doorHeight: {
      type: Number,
      required: false,
      default: null,
    },
    doorWidth: {
      type: Number,
      required: false,
      default: null,
    },
    jamb: {
      type: String,
      required: false,
      default: null,
    },
    doorStyle: {
      type: String,
      required: false,
      default: null,
    },
    doorFinish: {
      type: String,
      required: false,
      default: null,
    },
    doorOpening: {
      type: String,
      required: false,
      default: null,
    },
    doorHingColor: {
      type: String,
      required: false,
      default: null,
    },
    casing: {
      type: String,
      required: false,
      default: null,
    },
    useMyOwnTrim: {
      type: Boolean,
      required: false,
      default: null,
    },
    hardware: {
      type: String,
      required: false,
      default: null,
    },
    useMyOwnDoorHandle: {
      type: Boolean,
      required: false,
      default: null,
    },
    selectedRoomInfo: {
      type: String,
      required: false,
      default: null,
    },
    doorCasing: {
      type: String,
      required: false,
      default: null,
    },
    useMyOwnCasing: {
      type: Boolean,
      required: false,
      default: false,
    },
    gridColor: {
      type: String,
      required: false,
      default: null,
    },
    privacy: {
      type: Boolean,
      required: false,
      default: false,
    },
    grid: {
      type: Boolean,
      required: false,
      default: false,
    },
    safetyGlass: {
      type: Boolean,
      required: false,
      default: false,
    },
    temperedGlass: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model('OrderDetail', OrderDetail);
