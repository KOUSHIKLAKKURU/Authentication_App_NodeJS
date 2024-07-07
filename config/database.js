const mongoose=require("mongoose");

require("dotenv").config();

const dbConnect=()=>{
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{console.log("DB Connected Successfully")})
    .catch((err)=>{
        console.error(err);
        console.log("DB Connection Issues");
        process.exit(1);
    });
}

module.exports=dbConnect;