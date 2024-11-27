const dotenv = require('dotenv');
const env = dotenv.config().parsed;
console.log('env:', env);
module.exports = function override(config, env) {
    config.resolve.fallback = {
      fs: false
    };
    config.module.rules = config.module.rules.filter(rule => !(rule.test && rule.test.toString().includes('worker.ts')));

    config.module.rules.push({
        test: /\.worker\.ts$/,
        use: [
            { 
              loader: 'worker-loader', 
              options: {
                filename: '[name].[contenthash].worker.js'
              }
            },
            { loader: 'ts-loader' }
        ]
    });
    config.stats = {
      children: true
    };
    return config;
  };