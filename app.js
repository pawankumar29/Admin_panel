require('./connection');
var express = require('express');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
// require connect-flash
var flash = require('connect-flash');
//for caching file
var staticify = require('staticify')(path.join(__dirname, 'public'));
// require passport module
var passport = require('passport');
// require session module
var session = require('express-session');
// to help secure Express/Connect apps with various HTTP headers
var helmet = require('helmet');
var paginate = require('paginate-for-mongoose');
var validator = require('express-validator');


function startTheAsyncOperation() {
    return new Promise((resolve, reject) => {
        let p1 = require("./models//settings").findOnePromise({});
        p1.then((config) => {
            global.config = config;
            resolve();
        }).catch(err => {
            console.log("error in get settings");
        });
    });
}

var app = express();
module.exports.appPromise = startTheAsyncOperation().then(() => {
    var swig = require('swig');
    // view engine setup
    app.set('views', path.join(__dirname, 'views'));
    app.set('view engine', 'html');
    app.engine('html', swig.renderFile);

    app.use(favicon());
    // app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(cookieParser());

    // middleware for init the passport module
    app.use(session({
        name: "campus_recruiter_admin_session_id",
        secret: global.config.secret,
        resave: false,
        saveUninitialized: false
    })); // session secret
    app.use(passport.initialize());
    app.use(passport.session()); // persistent login sessions
    app.use(flash()); // use connect-flash for flash messages stored in session
    app.use(validator());
    /*staticify*/
    app.use(staticify.middleware);
    app.locals = {
        getVersionedPath: staticify.getVersionedPath
    };
    /**
     * static assets in your public directory will be cached for 30 days!
     * Visitors won’t have to re-download your CSS, images, or any other static assets in /public.
     */
    app.use(function (req, res, next) {
        req.url = req.url.replace(/\/([^\/]+)\.[0-9a-f]+\.(css|js|jpg|png|gif|svg)$/, '/$1.$2');
        next();
    });
    app.use(express.static(path.join(__dirname, 'public'), {
        maxAge: '10 days'
    }));

    app.use('/email_verification', require('./routes/email_verification'));
    app.use('/', require('./routes/index'));

    app.use('/', function (req, res, next) {
        if (req.user) {
            res.locals.user = {
                _id: req.user._id,
                name: req.user.name,
                theme: req.user.theme,
                role: req.user.role,
                profile_pic: req.user.profile_pic,
                organisation_id: req.user.organisation_id
            };
            //            res.locals.session = req.session;
            res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
            next();
        } else if (req.xhr) {
            res.send("unauthorised");
        } else {
            res.redirect('/login');
        }
    });

    app.use('/dashboard', require('./routes/dashboard'));
    app.use('/categories', require('./routes/categories'));
    app.use('/students', require('./routes/students'));
    app.use('/institutes', require('./routes/institutes'));
    app.use('/quiz', require('./routes/quiz'));
    app.use('/instructions', require('./routes/instructions'));
    app.use('/contact_us', require('./routes/contact_us'));
    app.use('/pages', require('./routes/pages'));
    app.use('/faqs', require('./routes/faqs'));
    app.use('/emailTemplate', require('./routes/emailTemplate'));
    app.use('/otp_verification', require('./routes/otp_verification'));
    app.use('/result', require('./routes/results'));

    // middleware for logout
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    /// catch 404 and forwarding to error handler
    app.use(function (req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        res.render('error', {
            message: err.message,
            error: err
        });
    });

    /// error handlers

    // development error handler
    // will print stacktrace
    if (app.get('env') === 'development') {
        app.use(function (err, req, res, next) {
            res.status(err.status || 500);
            res.render('error', {
                message: err.message,
                error: err
            });
        });
    }

    // production error handler
    // no stacktraces leaked to user
    app.use(function (err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: {}
        });
    });

    return app;
});