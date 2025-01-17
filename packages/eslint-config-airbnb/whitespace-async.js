#!/usr/bin/env node

const entries = require('object.entries');
const { ESLint } = require('eslint');

const baseConfig = require('.');
const whitespaceRules = require('./whitespaceRules');

const severities = ['off', 'warn', 'error'];

function getSeverity(ruleConfig) {
  if (Array.isArray(ruleConfig)) {
    return getSeverity(ruleConfig[0]);
  }
  if (typeof ruleConfig === 'number') {
    return severities[ruleConfig];
  }
  return ruleConfig;
}

async function onlyErrorOnRules(rulesToError, config) {
  const errorsOnly = { ...config };
  const cli = new ESLint({
    useEslintrc: false,
    baseConfig: config
  });
  const baseRules = (await cli.calculateConfigForFile(require.resolve('./'))).rules;

  entries(baseRules).forEach((rule) => {
    const [ruleName, ruleConfig] = rule;
    const severity = getSeverity(ruleConfig);

    if (rulesToError.indexOf(ruleName) === -1 && severity === 'error') {
      if (Array.isArray(ruleConfig)) {
        errorsOnly.rules[ruleName] = ['warn'].concat(ruleConfig.slice(1));
      } else if (typeof ruleConfig === 'number') {
        errorsOnly.rules[ruleName] = 1;
      } else {
        errorsOnly.rules[ruleName] = 'warn';
      }
    }
  });

  return errorsOnly;
}

onlyErrorOnRules(whitespaceRules, baseConfig).then((config) => console.log(JSON.stringify(config)));
