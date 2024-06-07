const mongoose = require('mongoose');
mongoose.set('strictQuery',false)
const mongoURI = "mongodb+srv://hamzaamjad:hamzaamjad@cluster0.fc3iuap.mongodb.net/notesapp?retryWrites=true&w=majority";

const connectToMongo=()=>{
    mongoose.connect(mongoURI);
    console.log("connected to mongodb");
}

module.exports = connectToMongo;