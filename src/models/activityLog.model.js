import mongoose from 'mongoose';

const { Schema } = mongoose;
const ActivityLog = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
        },
    order: {
        type: Schema.Types.ObjectId,
        ref: 'Order',
        required: true
    },
    title:{
        type:String,
        default:null
    },
    message:{
        type:String,
        default:null
    },
    type:{
        type:String,
        default:null
    },
    statusBit:{
        type: Boolean,
        default: true
    },
    delBit: {
        type: Boolean,
        default: false,
        }
        },
    { timestamps: true }
        );

export default mongoose.model('ActivityLog', ActivityLog);
