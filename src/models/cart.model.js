import mongoose from 'mongoose';

const { Schema } = mongoose;
const Cart = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    serviceId: {
        type: Schema.Types.ObjectId,
        ref: 'Service',
        required: true
    },
    serviceName: {
      type: String,
      default: null
    },
    repairType: {
      type: String,
      default: null
    },
    propertyId: {
        type: Schema.Types.ObjectId,
        ref: 'Property',
        required: true
    },
    roomInfo: {
      type: String,
      default: null,
    },
    distanceFromGround: {
      type: String,
      default: null,
    },
    floorInfo: {
      type: String,
      default: null,
    },
    width: {
      type: String,
      default: null,
    },
    height: {
      type: String,
      default: null,
    },
    temperedGlass: {
      type: String,
      default: null,
    },
    glassType: {
      type: String,
      default: null,
    },
    windowType: {
      type: String,
      default: null,
    },
    colorSelection: {
      type: String,
      default: null,
    },
    windowStyle: {
      type: String,
      default: null,
    },
    windowOpening: {
      type: String,
      default: null,
    },
    openingDirection: {
      type: String,
      default: null,
    },
    totalPrice: {
      type: String,
      default: null,
    },
    statusBit: {
        type: Boolean,
        default: true
    },
    image: {
        type: String,
        default: null,
    },
    delBit: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
  );

export default mongoose.model('Cart', Cart);
