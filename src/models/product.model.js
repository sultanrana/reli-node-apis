import mongoose from 'mongoose';

const { Schema } = mongoose;
const ProductSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    name: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: null
    },
    service: {
          type: String,
          default: null,
    },
    code: {
        type: String,
        default: null,
    },
    delBit: {
      type: Boolean,
      default: false,
    },

  },
  { timestamps: true }
  );

export default mongoose.model('Product', ProductSchema);
