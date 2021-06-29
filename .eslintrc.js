/*
 * http://eslint.org/docs/rules/
 */
module.exports = {
    extends: [
        'pandora-typescript',
    ],
    "settings": {
        "react": {
            "version": "16.0",
        },
    },
    rules: {
        'prefer-promise-reject-errors': 0,
    },
};
