// parse package.json
// use the version specified for electron in package.json
var fs = require('fs');
var str = fs.readFileSync('./package.json')
var json = JSON.parse(str);
var version = "0.0.0";
if(json && json['dependencies'] && json['dependencies']['electron']) {
    version = json['dependencies']['electron'];
}
module.exports = {
    version: version
};
console.log(module.exports.version);