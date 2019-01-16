var local = {
    name: 'development',
    serviceUrl: 'http://127.0.0.1:3038/',
    adminUrl: 'http://127.0.0.1:3039/',
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
