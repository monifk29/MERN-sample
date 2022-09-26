const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name : String,
    email : String,
    pass : String
});
let UserSchema = mongoose.model("users",userSchema);

module.exports = UserSchema