var path = require('path');

var ROOT_DIR = __dirname;

function _path(relativePath) {
    return path.resolve(ROOT_DIR, relativePath);
}

module.exports = {
    entry: _path('src/index.js'),
    module: {
        loaders: [
            {
                test: /\.js$/i,
                exclude: /node_modules/,
                loader: 'babel'
            }
        ]
    },
    output: {
        filename: 'vdom.js',
        path: _path('build')
    }
};
