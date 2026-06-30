import mongoose from 'mongoose';

const roundSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    duration: { type: String, default: '' },
    tips: { type: String, default: '' },
  },
  { _id: true }
);

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    logoUrl: {
      type: String,
      default: '',
    },
    description: {
      type: String,
      default: '',
    },
    website: {
      type: String,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    rounds: {
      type: [roundSchema],
      default: [],
    },
  },
  { timestamps: true }
);

companySchema.index({ isActive: 1, name: 1 });

export default mongoose.model('Company', companySchema);
