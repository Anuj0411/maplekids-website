const CracoAlias = require('craco-alias');
const path = require('path');

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
    }
  }
};
