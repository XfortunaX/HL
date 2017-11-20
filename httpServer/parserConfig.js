const loadConfig = require('load-config-file');
const confParse = /^(\w+)\s([^\s]+)/mg;

loadConfig.register('.conf', context => {
  const conf = {};

  let str = confParse.exec(context);
  while (str !== null) {
    const [, strName, strValue] = str;
    conf[strName] = +strValue || strValue;
    str = confParse.exec(context);
  }

  return conf
});

function parse(filename) {
  return loadConfig(filename);
}

module.exports = parse;
