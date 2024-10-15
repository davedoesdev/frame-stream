import globals from "globals";

export default [{
    languageOptions: {
        globals: {
            ...globals.node,
        },
    },

    rules: {
        "new-parens": 0,
        curly: 0,
        "no-use-before-define": 0,
        "no-underscore-dangle": 0,
        "no-debugger": 1,
        "no-warning-comments": 1,
        "max-nested-callbacks": [2, 4],
        "handle-callback-err": 2,
        radix: 2,
        semi: [2, "never"],
        quotes: [2, "single"],
        "consistent-this": [2, "self"],

        "no-unused-vars": [2, {
            vars: "all",
            args: "after-used",
        }],

        "no-multi-spaces": 0,
    },
}];