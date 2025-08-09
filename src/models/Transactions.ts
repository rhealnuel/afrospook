// models/Transactions.ts
import mongoose from "mongoose";

const AttendeeSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
  },
  { _id: false }
);

const TransactionSchema = new mongoose.Schema(
  {
    transactionReference: { type: String, required: true, index: true },
    paymentReference: { type: String, required: true, index: true },
    amountPaid: { type: Number, required: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    paidOn: { type: Date, required: true },

    // NEW: store multiple serials
    serials: { type: [String], required: true, index: true },

    // Optional extra data you send from client
    ticket: {
      id: Number,
      name: String,
      price: Number,
      seats: Number,
    },
    attendees: { type: [AttendeeSchema], default: [] },

    raw: { type: Object },
  },
  { timestamps: true }
);

// If you still want a unique guarantee per serial, create a unique partial index
// (Note: unique on arrays is tricky; this creates a multi-key unique index)
TransactionSchema.index({ serials: 1 }, { unique: true });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", TransactionSchema);
