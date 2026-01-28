const CracoAlias = require('craco-alias');
const path = require('path');
const CssMinimizerPlugin = require('css-minimizer-webpack-plugin');

module.exports = {
  plugins: [
    {
      plugin: CracoAlias,
      options: {
        source: 'tsconfig',
        baseUrl: './src',
        tsConfigPath: './tsconfig.json'
      }
    }
  ],
  webpack: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      '@/components': path.resolve(__dirname, 'src/components'),
      '@/features': path.resolve(__dirname, 'src/features'),
      '@/hooks': path.resolve(__dirname, 'src/hooks'),
      '@/utils': path.resolve(__dirname, 'src/utils'),
      '@/types': path.resolve(__dirname, 'src/types'),
      '@/constants': path.resolve(__dirname, 'src/constants'),
      '@/firebase': path.resolve(__dirname, 'src/firebase'),
      '@/services': path.resolve(__dirname, 'src/services'),
      '@/styles': path.resolve(__dirname, 'src/styles'),
      '@/assets': path.resolve(__dirname, 'src/assets'),
      '@/pages': path.resolve(__dirname, 'src/pages'),
      '@/i18n': path.resolve(__dirname, 'src/i18n'),
    },
    configure: (webpackConfig, { env, paths }) => {
      // Replace CSS minimizer with safer configuration
      if (env === 'production') {
        const minimizerIndex = webpackConfig.optimization.minimizer.findIndex(
          (minimizer) => minimizer.constructor.name === 'CssMinimizerPlugin'
        );
        
        if (minimizerIndex > -1) {
          webpackConfig.optimization.minimizer[minimizerIndex] = new CssMinimizerPlugin({
            minimizerOptions: {
              preset: [
                'default',
                {
                  discardComments: { removeAll: true },
                  normalizeWhitespace: true,
                  // Disable unsafe optimizations
                  svgo: false,
                  calc: false,
                  colormin: false,
                  convertValues: false,
                  discardOverridden: false,
                  mergeRules: false,
                  minifyFontValues: false,
                  minifyGradients: false,
                  minifyParams: false,
                  minifySelectors: false,
                  normalizeCharset: false,
                  normalizeDisplayValues: false,
                  normalizePositions: false,
                  normalizeRepeatStyle: false,
                  normalizeString: false,
                  normalizeTimingFunctions: false,
                  normalizeUnicode: false,
                  normalizeUrl: false,
                  orderedValues: false,
                  reduceIdents: false,
                  reduceInitial: false,
                  reduceTransforms: false,
                  uniqueSelectors: false,
                },
              ],
            },
          });
        }
      }
      
      return webpackConfig;
    }
  }
};
