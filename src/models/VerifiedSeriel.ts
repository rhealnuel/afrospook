import mongoose, { Schema, Model, InferSchemaType } from "mongoose";

const SERIAL_REGEX = /^[A-Z0-9]{6}$/;

const VerifiedSerialSchema = new Schema(
  {
    // The serial that was redeemed (always uppercase)
    serial: {
      type: String,
      required: true,
      unique: true,
      index: true,
      uppercase: true,
      trim: true,
      match: SERIAL_REGEX,
    },

    // Links back to your Transaction (optional but useful)
    transactionId: { type: Schema.Types.ObjectId, ref: "Transaction" },

    // Snapshot of attendee info at the time of verification
    attendee: {
      name: { type: String, default: "" },
      email: { type: String, default: "" },
      ticketName: { type: String, default: "" },
    },

    // Snapshot of ticket/payment info (optional)
    payment: {
      paymentReference: String,
      transactionReference: String,
      amountPaid: Number,
    },

    // Operational metadata
    usedAt: { type: Date, default: Date.now }, // when it was verified
    usedBy: { type: String, default: "" },     // staff username/id
    gate:   { type: String, default: "" },     // e.g., "Gate A" / "Main"
    venue:  { type: String, default: "" },     // e.g., "Elegushi Beach, Lagos"
    ip:     { type: String, default: "" },
    userAgent: { type: String, default: "" },

    // Status for potential admin actions
    status: {
      type: String,
      enum: ["USED", "REVOKED"],
      default: "USED",
      index: true,
    },
  },
  { timestamps: true }
);

// Optional compound index for analytics (query by gate/date)
VerifiedSerialSchema.index({ gate: 1, usedAt: -1 });

// Atomic "claim" helper: insert if not exists, otherwise report already used
interface IVerifiedSerial extends InferSchemaType<typeof VerifiedSerialSchema> {}
interface IVerifiedSerialModel extends Model<IVerifiedSerial> {
  claim: (
    serial: string,
    payload: Partial<IVerifiedSerial>
  ) => Promise<{ doc: IVerifiedSerial | null; alreadyUsed: boolean }>;
}

VerifiedSerialSchema.statics.claim = async function (
  serial: string,
  payload: Partial<IVerifiedSerial>
) {
  const res = await this.findOneAndUpdate(
    { serial: serial.toUpperCase() },
    {
      $setOnInsert: {
        serial: serial.toUpperCase(),
        usedAt: new Date(),
        status: "USED",
        ...payload,
      },
    },
    {
      upsert: true,
      new: true,
      rawResult: true, // so we can inspect lastErrorObject
    }
  );
  // If upserted is undefined and value exists, it was already there
  const alreadyUsed = !res.lastErrorObject?.upserted;
  return { doc: (res.value as IVerifiedSerial) || null, alreadyUsed };
};

export default (mongoose.models.VerifiedSerial as IVerifiedSerialModel) ||
  (mongoose.model<IVerifiedSerial, IVerifiedSerialModel>(
    "VerifiedSerial",
    VerifiedSerialSchema
  ) as IVerifiedSerialModel);
