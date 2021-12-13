module.exports = {
  extends: [
    'plugin:vue/vue3-essential',
    'standard',
    'plugin:@typescript-eslint/recommended'
  ],
  plugins: [
    'vue',
    '@typescript-eslint'
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    // tsconfigRootDir: __dirname,
    // project: ['./tsconfig.json'],
    parser: '@typescript-eslint/parser',
    ecmaVersion: 2021,
    sourceType: 'module'
  },
  env: {
    browser: true,
    node: true,
    es2021: true
  },
  settings: {
    'import/resolver': {
      alias: {
        map: [['@', './src']],
        extensions: ['.ts', '.js', '.jsx', '.json', '.vue']
      }
    }
  },
  rules: {
    'import/no-duplicates': ['error', { considerQueryString: true }],
    'no-duplicate-imports': false
  }
}
