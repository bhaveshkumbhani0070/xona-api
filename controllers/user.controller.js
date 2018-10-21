
const User = require('../models/user.model');
const SendOtp = require('sendotp');
const config=require("../config.json");
const sendOtp = new SendOtp(config.otpAuth,'Otp for XONA.in is {{otp}}, please do not share it with anybody');
const fun=require('./function');




//Simple version, without validation or sanitation
exports.signup = function (req, res) {

    User.find({mobile:req.body.mobile},function(err,oldUser){
        if(!err){
            if(oldUser.length>0){
                console.log('User alredy register with this mobile number');
                res.status(500).json({status:false,message:'User alredy register with this mobile number. Please login.'});
                return;
            }
            else{

            }
        }
        else{

        }
    });

    // Will send otp on mobile
    sendOTP(req.body.mobile,"PRIIND");

    // Genrate uniq code for user which will use as a refrence code
    genrateCode(function(cData){

        //check code is found in database or not
        if(req.body.parentCode){
            User.find({code:req.body.parentCode},function(err,parentData){
                if(!err){
                    if(parentData.length>0){
                        console.log('data found');
                        User.findByIdAndUpdate(parentData[0]._id, {$push: {childCode:cData}}, function (err, product) {
                            if (err){
                                console.log('Error for update ');
                                return;
                                // res.json({code:200,status:'error',message:'Error for update'});
                                // return;
                            }
                            else{
                                // Create new user with parent code and child code blank for feature update
                                console.log('Error for push child code into child array');
                                return;
                            }
                        });
                    }
                    else{
                        console.log('data not found');
                        return;
                    }
                }
                else{
                    res.status(500).json({ status: false,message:'Error for get a data for parent' })
                    return;
                }
            })
        }

        let user = new User(
            {
                name: req.body.name,
                mobile:req.body.mobile,
                code:cData,
                parentCode:req.body.parentCode,
                childCode:[],
                verified:false,
                create_at:new Date()
            }
        );

        user.save(function (err,data) {
            if (err) {
                console.log('Error',err);
                return;
            }
            else{
                res.status(200).json({ status: true,message:'User created successfull !',data:data });
                return;
            }
        })

    });
};


function genrateCode(callback){
    var choice = fun.makeid();
    callback(choice);
}

function sendOTP(mobi,mes){
    sendOtp.send(mobi, mes, function(err,data){
        if(!err){
            console.log('Send successfully',data);
        }
        else{
            console.log('Error for sending OTP',err);
        }
    });
}


exports.verifyOTP=function(req,res){
    var mobi=req.body.mobile;
    var otp=req.body.otp;

    sendOtp.verify(mobi, otp, function(err,Otpdata){
        if(!err){
            console.log('Otpdata',Otpdata);
            User.find({mobile:mobi},function(err,data){
                if(!err){
                    console.log('found',data[0]._id);
                    User.findByIdAndUpdate(data[0]._id, {$set: {verified:true}}, function (err, product) {
                        if (err){
                            res.status(500).json({ status: false,message:'Error for update' });
                            return;
                        }
                        else{
                            res.status(200).json({ status:true,message:'Account successfully verified !' });
                            return;
                        }
                    });
                }
                else{
                    res.status(500).json({ status: false,message:'Error for find user using mobile number' });
                    console.log('Error ',err);
                    return;
                }
            })
        }
        else{
            console.log('Error for match OTP');
            res.status(200).json({ status:true,message:'OTP match successfully !' });
            return;
        }
    });
}
// console.log('math',fun.getRandomInt(4));


exports.login=function(req,res){

}


exports.user_details=function(req,res){
    User.findById(req.params.id, function (err, product) {
        if (err){
            console.log('Error',err);
        }
        res.send(product);
    })
}

exports.user_update=function(req,res){
    User.findByIdAndUpdate(req.params.id, {$set: req.body}, function (err, product) {
        if (err){
            console.log('Error for update profile',err);
        }
        res.send('Product udpated.');
    });
}

exports.user_delete=function(req,res){
    User.findByIdAndRemove(req.params.id, function (err) {
        if (err){
            console.log('Error',err);
        }
        res.send('Deleted successfully!');
    })
}

