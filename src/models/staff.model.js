import mongoose from 'mongoose';

const { Schema } = mongoose;
const StaffSchema = new Schema({
    // user: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'User',
    //     required: true
    // },
    company: {
      type: Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },
    email: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      default: null,
    },
    image: {
        type: String,
        default: null,
    },
    approvedByReli: {
      type: String,
        default: null,
    },
    status: {
      type: Boolean,
      default: true,
    },
    accountType: {
      type: String,
      default: 'staff',
    },
    delBit: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
  );

export default mongoose.model('Staff', StaffSchema);
