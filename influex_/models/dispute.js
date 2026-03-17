import mongoose from "mongoose";

const disputeSchema = new mongoose.Schema({

 dealId:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"Deal",
  required:true
 },

 raisedBy:{
  type:mongoose.Schema.Types.ObjectId,
  ref:"User"
 },

 reason:{
  type:String,
  required:true
 },

 description:{
  type:String
 },

 status:{
  type:String,
  enum:["open","investigating","resolved"],
  default:"open"
 }

},{timestamps:true})

export default mongoose.model("Dispute",disputeSchema)