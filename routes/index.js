var express = require('express');
var router = express.Router();

//require index controller
const controller = require('../controllers/indexController');
// require mongoose models
const mongoose = require('mongoose');
const user = require('../models/user');
// require passport-hash module for encrypt the password
const passwordHash = require('password-hash');
// require passport module
const passport = require('passport');
// require the strategy that we want to use
const LocalStrategy = require('passport-local').Strategy;
const roles = require("../helper/roles");
const users = mongoose.model("users");
// Middleware for supplied strategy and their configuration
passport.use(new LocalStrategy(
        {usernameField: 'email', passwordField: 'password'},
        function (email, password, done) {
            try {
                email = email.trim();
                password = password.trim();
                // find user by email
                let query = {email: email, is_deleted: 0, role: {$ne: roles.app_user}};
                user.findOne(query).then((user) => {
                    if (user.status != 1) {
                        return done(null, false, {message: 'There is no account currently associated with this e-mail'});
                    } else if (!passwordHash.verify(password, user.data.password)) {
                        return done(null, false, {message: 'The password entered is incorrect. Try again'});
                    }
                    return done(null, user.data);

                }).catch((error) => {
                    return done(error);
                })

            } catch (err) {
                console.log(err);
                return done(null, false, {message: err.message});

            }
        }));

// SerializeUser method of passport
passport.serializeUser(function (user, done) {
    try {
        console.log(user);
        done(null, user._id);
    } catch (err) {
        return done(null, false, {message: err.message});
    }
});

// DeserializeUser method of passport
passport.deserializeUser(function (id, done) {
    try {
        users.findById(id, function (err, user) {
            done(err, user);
        });
    } catch (err) {
        console.log(err);
        return done(null, false, {message: err.message});
    }
});



/* GET method to render login form */
router.get(['/', '/login'], controller.get_login);

/* GET method to render login form */
router.get('/authentication', controller.get_auth);

/* POST method to check email form */
router.post('/authentication', controller.post_auth);

/* POST method to login form */
router.post('/login', controller.post_login, passport.authenticate('local', {
    failureRedirect: '/authentication',
    failureFlash: true
}), function (req, res, next) {
    try {
        req.body.email = req.body.email.toLowerCase().trim();
        res.cookie('friendSpire', req.body.email, {httpOnly: true, maxAge: 28800000});
        req.session.image = 'logo.png';
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.render('error', {error: err});
    }
});


// Get method for forgot password
router.get('/forgot-password', controller.get_forgot_password);
// Post method for forgot password
router.post('/forgot-password', controller.post_forgot_password);
// Get request for reset-password
router.get('/reset-password/:id', controller.get_reset_password);
// Post request for reset-password
router.post('/reset-password/:id', controller.post_reset_password);


module.exports = router;
