
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sender:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type:      { 
    type: String, 
    enum: ['like', 'follow', 'comment'],
    required: true 
  },
  prompt:    { type: mongoose.Schema.Types.ObjectId, ref: 'Prompt', default: null },
  read:      { type: Boolean, default: false },
}, { timestamps: true });


notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 1 * 24 * 60 * 60 });

export default mongoose.model('Notification', notificationSchema);