import mongoose, { Schema } from "mongoose";

const AttendeeSchema = new Schema(
  {
    name:       { type: String, default: "" },
    email:      { type: String, default: "" },
    serial:     { type: String, required: true, index: true }, // unique across all docs via compound index below
    ticketName: { type: String, required: true },
    // You can keep adding per-attendee fields here (e.g., checkedIn, seatNo, etc.)
  },
  { _id: false }
);

const PaymentSchema = new Schema(
  {
    transactionReference: { type: String, required: true, index: true },
    paymentReference:     { type: String, required: true, index: true },
    amountPaid:           { type: Number, required: true },
    customerName:         { type: String, required: true },
    customerEmail:        { type: String, required: true },
    paidOn:               { type: Date,   required: true },

    ticket: {
      id:    Number,
      name:  String,
      price: Number,
      seats: Number,
    },

    attendees: { type: [AttendeeSchema], default: [] },

    raw: { type: Object },
  },
  { timestamps: true }
);

// ✅ Each attendee serial must be globally unique
PaymentSchema.index(
  { "attendees.serial": 1 },
  { unique: true, partialFilterExpression: { "attendees.serial": { $exists: true, $type: "string" } } }
);

export default mongoose.models.Payment ||
  mongoose.model("Payment", PaymentSchema);
