const mongoose = require("mongoose");
require("dotenv").config(); // everything defined in  the env file will be loaded in process object
// connect db with server
const connect = ()=> {
    mongoose.connect(process.env.MONGODB_URL, {
            useNewUrlParser:true,
            useUnifiedTopology: true,

    })
    .then(()=> console.log("db connection done"))
    .catch(()=>{
        console.log("issue in db connection");
        console.error(error.message);
        // iska mtlb kya h 
        process.exit(1);
    });
}

module.exports=connect;

// ensure connection between ur application and ur db