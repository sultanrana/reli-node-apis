import mongoose from 'mongoose';

const { Schema } = mongoose;
const UserSchema = new Schema({
    email: {
      type: String,
    },
    profileImage: {
      type: String,
    },
    password: {
      type: String,
    },
    profilePic: {
      type: String,
    },
    gender: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    city: {
      type: String,
    },
    skills: {
      type: String,
      enum: ['QA', 'Developer', 'BDE', 'HR', 'BA'],
    },
    dateOfBirth : { 
      type: Date 
    }
  },
  { timestamps: true }
  );


export default mongoose.model('users', UserSchema);
