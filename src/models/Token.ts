import mongoose, { Document, Schema, Types } from "mongoose";

export interface IToken extends Document {
   token: string
   user: Types.ObjectId
   createdAt: Date
}

const tokenShecma: Schema = new Schema({
   token: {
      type: String,
      required: true
   },
   user: {
      type: Types.ObjectId,
      ref: 'User'
   },
   expiresAt: {
      type: Date,
      default: Date.now(),
      expires: '10m'
   }
})

const Token = mongoose.model<IToken>('Token', tokenShecma)
export default Token