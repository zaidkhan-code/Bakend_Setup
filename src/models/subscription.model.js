import mongoose, { Schema } from "mongoose";
const SubscriptionSchema = new Schema(
  {
    subsciber: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    channel: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);
const Subscription = mongoose.modal("subscription", SubscriptionSchema);
export default Subscription;
