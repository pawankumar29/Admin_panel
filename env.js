var local = {
    name: 'development',
    serviceUrl: 'http://127.0.0.1:3001/',
//        adminUrl: 'http://192.168.0.78:3017/',
    server: {
        host: '127.0.0.1',
        port: '3039'
    },
    database: {
        name: 'hireme'
    },
};
config = local;

global.fav_icon_path = "/images/favicon.ico";
global.logo_path = "/images/logo.png";

module.exports = config;
