
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var http = require('http');
var path = require('path');

var MongoStore = require('connect-mongo')(express);
var settings = require('./settings');
//会话
var flash = require('connect-flash');

var fs = require('fs');
var accessLog = fs.createWriteStream('access.log', {flags: 'a'});
var errorLog = fs.createWriteStream('error.log', {flags: 'a'});

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//模板会话
app.use(flash());
app.use(express.favicon());
app.use(express.logger('dev'));

app.use(express.logger({stream: accessLog}));




//json + urlencoded + multipart()
app.use(express.bodyParser({ keepExtensions: true, uploadDir: './public/images' }));
//app.use(express.json());
//app.use(express.urlencoded());


app.use(express.methodOverride());


//cookie 和 session 存储
app.use(express.cookieParser());
app.use(express.session({
    secret: settings.cookieSecret,
    key: settings, // cookie name
    cookie: {maxAge : 1000 * 60 *60 * 24 * 30}, // 30days
    store: new MongoStore({
        db: settings.db
    })

}));



app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

app.use(function (err, req, res, next) {
    var meta = '[' + new Date() + '] ' + req.url + '\n';
    errorLog.write(meta + err.stack + '\n');
    next();
});

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//app.get('/', routes.index);
//app.get('/users', user.list);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  console.log('--> You are OK!');
});



//routes
routes(app);