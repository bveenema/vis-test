module.exports = {
    entry: "./index.js",
    output: {
        path: __dirname,
        filename: "bundle.js"
    },

    module: {
        loaders: [
            { 
                test: /\.js$/,
                exclude: /node_modules/, 
                loader: 'babel',
                query: {
                    presets: ['es2015']
                }
             }
        ]
    },

    // plugins: [
    //     new webpack.ProvidePlugin({
    //         d3: 'd3',
    //     })
    // ]
};