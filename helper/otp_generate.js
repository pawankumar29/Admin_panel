// make a random number of 6 digit
exports.makeCode = function () {
    var text = '';
    var possible = 'ABCDEFGHIJKL01234MNOPQRST56789UVWXYZ';

    for (var i = 0; i < 6; i++) { text += possible.charAt(Math.floor(Math.random() * possible.length)); }
    return text;
};
