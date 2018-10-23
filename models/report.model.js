const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ReportSchema = new Schema({
    user_id:{type: String, required: true},
    advertisement:{type:String},
    downline:{type:String},
    refferal:{type:String},
    total_earning:{type:String},
    date:{type:Date}
});


// Export the model
module.exports = mongoose.model('Report', ReportSchema);


// View Today History:{type:String},