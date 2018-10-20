const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    name: {type: String, required: true, max: 100},
    mobile:{type:String,required:true,max:13},
    code:{type:String,required:true,max:10},
    parentCode:{type:String,required:false,max:10},
    childCode:[String],
    verified:{type:Boolean,required:true},
    create_at:{type:Date,required:true}
});


// Export the model
module.exports = mongoose.model('User', UserSchema);