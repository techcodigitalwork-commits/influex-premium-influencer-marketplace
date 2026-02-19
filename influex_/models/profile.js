import mongoose from "mongoose";

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      //required: true,
      unique: true
    },

    profileImage: {
           type: String
      },

    followers: {
             type: String,
        //     required: true,
             min: 0
             },

    role: {
      type: String,
      enum: ["influencer", "brand"],
      //required: true
    },

    name: {
      type: String,
      //required: true
    },

    bio: String,
    location: String,
    

    // Influencer specific
    categories: {
      type : String,
      //required : true 
    },
    //followers: Number,
    platform: String, // Instagram, YouTube etc

    // Brand specific
    companyName: String,
    website: String,
    industry : String

    // Photographer specific
   // experience: Number,
    //portfolioLink: String
  },
  { timestamps: true }
);

export default mongoose.model("Profile", profileSchema);
