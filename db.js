require('dotenv').config()
const mongoose = require('mongoose');
mongoose.set('strictQuery',false)
const mongoURI = process.env.mongoURI;

const connectToMongo=()=>{
    mongoose.connect(mongoURI);
    console.log("connected to mongo");
}

module.exports = connectToMongo;