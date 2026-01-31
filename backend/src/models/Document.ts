import mongoose, { Schema, type InferSchemaType, type Types } from "mongoose";

const documentSchema = new Schema(
  {
    // ownership
    ownerId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

    // document content
    title: { type: String, required: true, trim: true, maxlength: 120 },
    content: { type: String, default: "" },

    // permissions (edit)
    editorIds: [{ type: Schema.Types.ObjectId, ref: "User" }],

    // share link (read-only)
    publicToken: { type: String, default: null, index: true },
    isPublic: { type: Boolean, default: false },

    // edit lock (prevent simultaneous editing)
    lockedBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
    lockedAt: { type: Date, default: null }
  },
  { timestamps: true }
);

export type Document = InferSchemaType<typeof documentSchema> & { _id: Types.ObjectId };

export const DocumentModel =
  mongoose.models.Document || mongoose.model("Document", documentSchema);
