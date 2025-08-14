import mongoose from 'mongoose';

const UdyamSubmissionSchema = new mongoose.Schema(
  {
    aadhaarNumber: { type: String, required: true },
    nameOnAadhaar: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    otp: { type: String },
    panNumber: { type: String, required: true },
    businessName: { type: String, required: true },
    businessType: { type: String, required: true },
    email: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  },
  {
    collection: 'udyam_submissions'
  }
);

export default mongoose.models.UdyamSubmission || mongoose.model('UdyamSubmission', UdyamSubmissionSchema);


