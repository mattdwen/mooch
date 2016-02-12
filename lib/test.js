var moment = require('moment');
var Tools = require('./tools');

var dtt = Tools.dateTime();
var human = dtt.humanizeDateTime('2016-02-12T00:00:00+13:00');
console.info(human);
