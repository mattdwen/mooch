var appRoot = 'src/';
var outputRoot = 'lib/';

module.exports = {
	source: appRoot + '**/*.ts',
	output: outputRoot,
	dtsSrc: [
    'typings/**/*.ts',
  ]
}
