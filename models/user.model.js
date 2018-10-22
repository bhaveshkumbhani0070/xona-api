const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let UserSchema = new Schema({
    firstname:{type: String, required: true, max: 100},
    lastname: {type: String, required: true, max: 100},
    mobile:{type:String,required:true},
    email:{type:String,required:false},
    alternate_email:{type:String,required:false},
    dob:{type:Date,required:false},
    merriag_date:{type:Date,required:false},
    area:{type:String,required:false},
    pincode:{type:String,required:false},
    city:{type:String,required:false},
    country:{type:String,required:false},
    gender:{type:String,required:false},
    reffaral_id:{type:String,required:false,max:10},
    code:{type:String,required:true,max:10},//own uniq id
    childCode:[String],// all child
    gst_no:{type:String,required:false},
    verified:{type:Boolean,required:true},
    create_at:{type:Date,required:true}
});


// Export the model
module.exports = mongoose.model('User', UserSchema);