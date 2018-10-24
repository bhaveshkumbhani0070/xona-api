
const User = require('../models/user.model');
const Report=require('../models/report.model');

const SendOtp = require('sendotp');
const config=require("../config.json");
const sendOtp = new SendOtp(config.otpAuth,'Otp for XONA.in is {{otp}}, please do not share it with anybody');
const fun=require('./function');
var mongoose = require('mongoose');
var jwt = require("jsonwebtoken");


// ******************************** Users ******************************** //

 //Simple version, without validation or sanitation
exports.signup = function (req, res) {
    console.log("*** Requested for Creating New User... ***");
    receivedValues = req.body
    if (JSON.stringify(receivedValues) === '{}')
    {
        res.status(400).json({status:false,message:'Please fill the fields'});
        return;
    }
    else
    {
         usercolumns = [
             "firstname", "lastname",
              "primaryNumber","secondaryNumber",
             "email", "alternate_email","dob",
             "merriag_date", "area", "pincode",
             "city", "country", "gender",
             "reffaral_id","code", "childCode",
             "gst_no", "verified","create_at",
             "deviceData","packageList"
            ];

        var dbValues = [];
        var checkProfessional = false;
        for (var iter = 0; iter < usercolumns.length; iter++) {
            columnName = usercolumns[iter];

            if ((receivedValues[columnName] == undefined || receivedValues[columnName] == "") &&
            (columnName == 'firstname' || columnName == 'lastname' || columnName=='primaryNumber'|| columnName=='secondaryNumber' ))
            {
                console.log("*** Redirecting: ", columnName, " field is required");
                res.json({"code": 400, "status": "Error", "message": columnName + " field is undefined"});
                logger.error('*** Redirecting: ', columnName, ' field is required');
                return;
            }
            if (receivedValues[columnName] == undefined || receivedValues[columnName] == "")
            {
                dbValues[iter] = '';
                receivedValues[columnName]='';
            }
            else
            {
                dbValues[iter] = receivedValues[columnName];
            }
        }
        receivedValues.create_at=new Date();
        receivedValues.verified=false;
        console.log('dbValues',receivedValues);
        genrateCode(function(cData){
            receivedValues.code=cData;


            User.find({$or:[{primaryNumber:req.body.primaryNumber},{secondaryNumber:req.body.secondaryNumber}] },function(err,oldUser){
                if(!err){
                    if(oldUser.length>0){
                        console.log('User alredy register with this mobile number');
                        genrateToken(oldUser[0]._id,oldUser[0].code,function(token){
                            res.status(200).json({
                                status:true,
                                message:'User alredy register with this mobile number.',
                                data:oldUser,
                                token:token
                                });
                            return;
                        })
                    }
                    else{
                        // Will send otp on mobile
                        sendOTP(req.body.primaryNumber || req.body.secondaryNumber,"PRIIND");
                        // Genrate uniq code for user which will use as a refrence code

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

                            let user = new User(receivedValues);

                            user.save(function (err,data) {
                                if (err) {
                                    console.log('Error for save data',err);
                                    res.status(500).json({ status: false,message:'Error for save user details' });
                                    return;
                                }
                                else{
                                    genrateToken(data._id,data.code,function(token){
                                        res.status(200).json({
                                            status: true,
                                            message:'User created successfull !',
                                            data:data,
                                            token:token
                                        });
                                        return;
                                    });
                                }
                            })

                    }
                }
                else{
                    console.log('Error for get user details');
                    res.status(500).json({ status: false,message:'Error for find user detail' });
                    return;
                }
            });
        });
    }
};


// var name=req.user.name;
// console.log('name',name);
exports.login=function(req,res){
    var primaryNumber=req.body.primaryNumber;
    User.find({primaryNumber:primaryNumber},function(err,data){
        if(!err){
            if(data.length>0){

            }
            else{

            }
        }
        else{
            console.log('Error for find user data',err);
            res.status(500).json({status:false,message:'Error for find user using primary number'});
            return;
        }
    })
}

exports.send_Otp=function(req,res){
    User.find({$or:
        [
            {primaryNumber:req.body.primaryNumber},
            {secondaryNumber:req.body.secondaryNumber}
        ]
    },function(err,Pdata){
        if(!err){
            if(Pdata.length>0){
                // Check user with primary number is verified or not
                if(Pdata[0].verified){
                    // Is verified send response with verified
                    res.status(200).json({status:true,message:'User is alredy verified, Please login',data:Pdata});
                    return;
                }
                else{
                    unregister_sendOtp(Pdata);
                }
            }
            else{
                unregister_sendOtp(false);
            }
        }
        else{
            console.log('Error for find primary number',err);
            res.status(500).json({status:false,message:'Error for find with primary number'});
            return;
        }
    })
    function unregister_sendOtp(pdata){
        sendOtp.send(req.body.primaryNumber || req.body.secondaryNumber,"PRIIND", function(err,data){
                if(!err){
                    console.log('Send successfully',data);
                    if(data.type=='success'){
                        if(pdata){
                            res.status(200).json({status:true,message:'User is not register',data:pdata});
                            return;
                        }
                        else{
                            res.status(200).json({status:true,message:'OTP send successfully!',data:{verified:false}});
                            return;
                        }
                    }
                    else{
                        console.log('Error for send OTp',data.message);
                        res.status(400).json({status:false,message:data.message});
                        return;
                    }
                }
                else{
                    console.log('Error for sending OTP',err);
                    res.status(400).json({status:false,message:'Error for send OTP'});
                    return;
                }
            });
    }
}


exports.send_all_package=function(req,res){
   var user_id=req.body.user_id;
   var packageList=req.body.packageList;
   User.findByIdAndUpdate(user_id, {$set: {packageList:packageList}}, function (err, product) {
    if (err){
        console.log('Error for update profile',err);
        res.status(400).json({status:false,message:'Error for update user'});
        return;
    }
    else{
        User.findOne(mongoose.Types.ObjectId(user_id),function(err,userData){
            if(!err){
                res.status(200).json({status:true,message:'Package add successfully!',data:userData});
                return;
            }
            else{
                console.log('Error for find user',err);
                res.status(400).json({status:false,message:'Error for find user'});
                return;
            }
        })
    }
    });
}


function genrateCode(callback){
    var choice = fun.makeid();
    callback(choice);
}

function genrateToken(id,code,callback){
    var token = jwt.sign({id:id,code:code}, config.secret, {
            expiresIn: 1440 * 60 * 30 // expires in 1440 minutes
    });
    callback(token);
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
    var primaryNumber=req.body.primaryNumber;
    var secondaryNumber=req.body.secondaryNumber;
    var otp=req.body.otp;

    sendOtp.verify(primaryNumber, otp, function(err,Otpdata){
        if(!err){
            console.log('Otpdata',Otpdata);
            if(Otpdata.type!='error'){
                verifiAccount('primaryNumber',primaryNumber)
            }
            else{
                sendOtp.verify(secondaryNumber,otp,function(err,Otpdata){
                    if(!err){
                        if(Otpdata.type!='error'){
                            verifiAccount('secondaryNumber',secondaryNumber)
                        }
                        else{
                            res.status(500).json({ status:false,message:'OTP not match!' });
                            return;
                        }
                    }
                    else{
                        console.log('Error for match OTP');
                        res.status(400).json({ status:false,message:'Error for match OTP' });
                        return;
                    }
                })
            }
        }
        else{
            console.log('Error for match OTP');
            res.status(400).json({ status:true,message:'Error for match OTP' });
            return;
        }
    });

    function verifiAccount(field,value){
        if(field=='primaryNumber'){
            User.find({primaryNumber:value},function(err,data){
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
            User.find({secondaryNumber:value},function(err,data){
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

    }
}

// console.log('math',fun.getRandomInt(4));





exports.user_details=function(req,res){
    User.findById(req.user.id, function (err, product) {
        if (err){
            console.log('Error',err);
        }
        res.send(product);
    })
}

exports.update_user=function(req,res){
    console.log("*** Requested for EDITING/UPDATING User... ***");
    receivedValues = req.body //DATA FROM WEB
    if (JSON.stringify(receivedValues) === '{}')
    {
        res.status(400).json({status:false,message:'Body data required'});
        return;
    }
    else
    {
        var updateString = "";
        console.log("*** Validating User Details... ");
        usercolumns = [
            "firstname", "lastname",
             "primaryNumber","secondaryNumber",
            "email", "alternate_email","dob",
            "merriag_date", "area", "pincode",
            "city", "country", "gender",
            "reffaral_id","code", "childCode",
            "gst_no", "verified","create_at",
            "deviceData","packageList"
           ];
        var dbValues = [];
        var tmpcolumnName = [];
        //FOR VALIDATING VALUES BEFORE SUBMISSION
        for (var iter = 0; iter < usercolumns.length; iter++)
        {
            columnName = usercolumns[iter];

            if (receivedValues[columnName] != undefined)
            {
                dbValues[iter] = receivedValues[columnName];
                tmpcolumnName[iter] = usercolumns[iter];
                if (updateString == "")
                    updateString = columnName + "='" + receivedValues[columnName] + "'";
                else
                    updateString = updateString + "," + columnName + "='" + receivedValues[columnName] + "'";
            }
        }

        console.log('receivedValues',receivedValues);

        User.findByIdAndUpdate(req.user.id, {$set: receivedValues}, function (err, product) {
            if (err){
                console.log('Error for update profile',err);
                res.status(400).json({status:false,message:'Error for update user'});
                return;
            }
            else{
                User.findOne(mongoose.Types.ObjectId(req.user.id),function(err,userData){
                    if(!err){
                        res.status(200).json({status:true,message:'User update successfully',data:userData});
                        return;
                    }
                    else{
                        console.log('Error for find user',err);
                        res.status(400).json({status:false,message:'Error for find user'});
                        return;
                    }
                })
            }
        });
    }
}

exports.user_delete=function(req,res){
    User.findByIdAndRemove(req.params.id, function (err) {
        if (err){
            console.log('Error',err);
            res.status(400).json({status:false,message:'Error for deleting user'});
            return;
        }
        res.send('Deleted successfully!');
    });
}



// ******************************** Reports ******************************** //

exports.get_today_report=function(req,res){

    Report.find({$and:[{_id:mongoose.Types.ObjectId(req.user.id)},{date:new Date()}]},
        function(err,Rdata){
            if(!err){
                res.status(200).json({status:true,message:'Today report get',data:Rdata});
                return;
            }
            else{
                console.log('Error for report data',err);
                res.status(400).json({status:false,message:'Error for get report data.'});
                return;
            }
    })
}