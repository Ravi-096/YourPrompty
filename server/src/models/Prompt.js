import mongoose from 'mongoose';

const promptSchema = new mongoose.Schema({
  title:    { type: String, required: true, maxlength: 100,  trim: true },
  content:  { type: String, required: true, maxlength: 5000, trim: true },
  category: { type: String, required: true, maxlength: 50 },
  image:    { type: String, default: null },
  creator:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likes:    [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

promptSchema.index({ title: 'text', content: 'text' });

export default mongoose.model('Prompt', promptSchema);