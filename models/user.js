var crypto = require('crypto');
var mongodb = require('./db');


function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
}

module.exports = User;

User.prototype.save = function (callback){

    var md5= crypto.createHash('md5'),
        email_MD5 = md5.update(this.email.toLowerCase()).digest('hex'),
        head = "http://www.gravatar.com/avatar/" + email_MD5 + "?s=48";

    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        head: head
    }

    //打开数据库
    mongodb.open(function (err,db){
        if (err){
            return callback(err);
        }
        db.collection('users', function (err, collection){
            if (err){
                mongodb.close();
                return callback(err);
            }

            collection.insert(user,{
                safe: true
            }, function (err,user){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                return callback(null, user[0]);
            });
        });
    });
}



//读取用户
/**
 *
 * @param name 用户名
 * @param callback
 */
User.get = function (name, callback){

    //打开数据库
    mongodb.open(function (err,db){
        if (err){
            return callback(err);
        }


        db.collection('users',function(err,collection){
            if (err){
                mongodb.close();
                return callback(err);
            }

            collection.findOne({
                name: name
            }, function (err,user){
                mongodb.close();
                if (err){
                    return callback(err);
                }
                console.log(user);
                return callback(null, user);
            })
        });
    });
}