var path = require('path');

var ROOT_DIR = __dirname;

function _path(relativePath) {
    return path.resolve(ROOT_DIR, relativePath);
}

module.exports = {
    entry: _path('test.js'),
    module: {
        loaders: [
            {
                test: /\.js$/i,
                exclude: /node_modules|build/,
                loader: 'babel'
            }
        ]
    },
    output: {
        filename: 'test.js',
        path: _path('build')
    }
};
