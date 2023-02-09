import mongoose from 'mongoose';

const { Schema } = mongoose;
const UserSchema = new Schema({
    email: {
    type: String,
    required: true,
    lowercase: true
    },
    profileImage: {
      type: String,
      default: null
    },
    firstName: {
      type: String,
      default: null
    },
    lastName: {
      type: String,
      default: null
    },
    userType: {
      type: String,
      default: null,
    },
    password: {
      type: String,
      default: null
    },
    address: {
      type: String,
      default: null
    },
    appartment: {
      type: String,
      default: null
    },
    willingRange: {
      type: String,
      default: null
    },
    zipCode: {
      type: String,
      default: null
    },
    state: {
      type: String,
      default: null
    },
    city: {
      type: String,
      default: null
    },
    phoneNumber: {
      type: String,
      default: null
    },
    otp: {
      type: String,
      default: "1234"
    },
    services: [
        {
            type: String,
            default: null
        }
    ],
    location: {
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
    },
    statusBit: {
      type: Boolean,
      default: true
    },
    delBit: {
      type: Boolean,
      default: false,
    },
    lastLoginAt: {
      type: Date,
      default: Date.now()
    },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company'
    },
    accountType: {
      type: String,
      default: 'standard_contractor',
    },
  },
  { timestamps: true }
  );

UserSchema.index({ location: '2dsphere' });

export default mongoose.model('users', UserSchema);
