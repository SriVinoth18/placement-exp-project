import mongoose from 'mongoose';

const experienceSchema = new mongoose.Schema(
  {
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    pdfUrl: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      default: '',
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    year: {
      type: Number,
      required: true,
    },
    role: {
      type: String,
      default: '',
      trim: true,
    },
    college: { type: String, default: null },
    branch: { type: String, default: null },
  },
  { timestamps: true }
);

experienceSchema.index({ company: 1, createdAt: -1 });

export default mongoose.model('Experience', experienceSchema);
