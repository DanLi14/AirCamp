const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true, //This sets up an index, it is not a validation tool.
  },
});

UserSchema.plugin(passportLocalMongoose); //This plugin will add field for password and validate usernames to be unique.

modules.exports = mongoose.model('User', UserSchema);

