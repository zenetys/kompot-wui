module.exports = {
    root: true,
    env: {
        node: true,
    },
    parserOptions: {
        parser: '@babel/eslint-parser',
        sourceType: 'module',
    },
    extends: ['eslint:recommended', 'plugin:vue/recommended', 'prettier'],
    rules: {
        'vue/html-indent': [
            'error',
            4,
            {
                attribute: 1,
                baseIndent: 1,
                closeBracket: 0,
                alignAttributesVertically: true,
                ignores: [],
            },
        ],
        'vue/max-attributes-per-line': [
            'error',
            {
                singleline: {
                    max: 8,
                },
                multiline: {
                    max: 8,
                },
            },
        ],
        indent: ['error', 4, { SwitchCase: 1 }],
        'vue/multi-word-component-names': 'off',
    },
    plugins: [
        'babel',
    ],
};
