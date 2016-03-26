/**
 * @file webpack config
 */
module.exports = {
    entry: {
        'client': require.resolve('./app/client.js')
    },
    output: {
        path: './',
        filename: './build/[name].js'
    },
        module: {
        loaders: [
            {
                test: /\.less$/,
                loader: "style!css!less"
            }
        ]
    }
};
