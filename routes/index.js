var crypto = require('crypto'),
    User = require('../models/user.js');


module.exports = function (app){
    app.get('/',function (req, res){
       res.render('index', {
           title: 'home',
           user: req.session.user,
           success: req.flash('success').toString(),
           error: req.flash('error').toString()
       });
    });
    app.get('/reg',checkNotLogin);
    app.get('/reg', function (req, res) {
        res.render('reg', {
            title: '注册',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });

    app.post('/reg',checkNotLogin);
    app.post('/reg', function (req, res){
        var name = req.body.name,
            password = req.body.password,
            password_re = req.body['password-repeat'];
        if ( password != password_re){
            req.flash('error', "两次密码不一致");
            return res.redirect('/reg');
        }

        //生成密码
        var md5 = crypto.createHash('md5'),
            password = md5.update(password).digest('hex');

        var newUser = new User({
            name: name,
            password: password,
            email: req.body.email
        });




        User.get(newUser.name, function(err,user){
           if(user){
               req.flash('error', '用户已存在');
               return res.redirect('/reg'); //返回注册页
           }

            //
            newUser.save(function (err, user){
                if(err){
                    req.flash('error', err);
                    res.redirect('/reg'); //返回注册页
                }
                req.session.user = user;
                req.flash('success', '注册成功');
                res.redirect('/');// 注册成功返回主页
            })
        });


    });

    app.get('/login',checkNotLogin);
    app.get('/login', function(req, res){
        res.render('login',{
            title: 'login',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    });
    app.post('/login',checkNotLogin);
    app.post('/login', function (req, res) {
        var md5 = crypto.createHash('md5'),
            password = md5.update(req.body.password).digest('hex');
        User.get(req.body.name, function (err, user) {
            if (!user) {
                req.flash('error', '用户不存在!');
                return res.redirect('/login');
            }
            if (user.password != password) {
                req.flash('error', '密码错误!');
                return res.redirect('/login');
            }
            req.session.user = user;
            req.flash('success', '登陆成功!');
            res.redirect('/');
        });
    });
    app.get('/post', checkLogin);
    app.get('/post', function (req, res){
        res.render('post', {
            title: 'post',
            user: req.session.user,
            success: req.flash('success').toString(),
            error: req.flash('error').toString()
        });
    })
    app.post('/post', checkLogin);
    app.post('/post', function (req, res){

    });

    app.get('/logout', function (req, res){
        req.session.user = null;
        req.flash('success', '登出成功');
        res.redirect('/');

    });

    function checkLogin(req, res, next){
        if (!req.session.user){
            req.flash('error', '未登录');
            res.redirect('/login');
        }
        next();
    }

    function checkNotLogin(req, res, next){
        if (req.session.user){
            req.flash('error', '已登陆');
            res.redirect('back');
        }
        next();
    }
}


