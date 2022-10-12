var local = {
    name: 'development',
    serviceUrl: 'http://127.0.0.1:3038/',
    adminUrl: 'http://127.0.0.1:3039/',
    server: {
        host: '127.0.0.1',
        port: '3039'
    },
    database: {
        name: 'campus_recruiter'
    },
    smtp : {
        host : "smtp.gmail.com",
        port : 465,
        secure : true,
        auth : {
        user : "hireme.debut@gmail.com",
        pass : "plgwtwqvmhomjjgs"
        }
        },
};
config = local;

global.fav_icon_path = "/images/favicon.ico";
global.logo_path = "/images/logo.png";
global.logo_path_side = "/images/logo_side.png";
global.image = "/images/default.png"

module.exports = config;