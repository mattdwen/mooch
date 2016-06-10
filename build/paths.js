var appRoot = 'src/';
var outputRoot = 'lib/';

module.exports = {
	source: appRoot + '**/*.ts',
	output: outputRoot,
	dist: './dist/',
	dtsSrc: [
    'typings/**/*.ts',
  ]
}
