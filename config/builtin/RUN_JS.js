const util = require('util')

const {
  NodeVM
} = require('vm2');

console.log('Arguments =', util.inspect(args, false, 1, true));

/**
 * @title Eval JS
 * @category JavaScript
 * @author Anonimus
 * @param {code} script
 */
async function RUN_JS(script) {
  const vm = new NodeVM({
    compiler: 'javascript',
    console: 'inherit',
    nesting: false,
  });

  let f = vm.run(script);

  temp.evalResult = f();
}

return RUN_JS(args.script);
