import mongoose from "mongoose";

const TransactionSchema = new mongoose.Schema({
  transactionReference: { type: String, required: true },
  paymentReference: { type: String, required: true },
  amountPaid: { type: Number, required: true },
  customerName: { type: String, required: true },
  customerEmail: { type: String, required: true },
  paidOn: { type: Date, required: true },
  serial: { type: String, required: true, unique: true },
  raw: { type: Object },
}, { timestamps: true });

export default mongoose.models.Transaction || mongoose.model("Transaction", TransactionSchema);
