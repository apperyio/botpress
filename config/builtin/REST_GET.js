//CHECKSUM:5fa02838e23ef0dbe9499d4fe41f6867374479a72f1e6c007bf3a633ddf5445f
"use strict";

/**
 * @title REST API Call GET
 * @category Services
 * @param {string} [url=https://jsonplaceholder.typicode.com/users/1]
 */

/** @ignore
 * @var temp
 * @var user
 *
 * ----------------------------
 * ---- Creating an Action ----
 * ----------------------------
 *
 * -- STORAGE --
 * In the global scope you have access to the following storage objects:
 * @var temp     Temporary flow-level storage.  Unique to every flow execution.  Ideal for logic implementation such as data returned from APIs.
 * @var user     Permanent user-level storage.  Unique to every users.  Ideal for remembering things specific to a user such as email, name, customerId, etc.
 * @var session  Temporary session-level storage.  Unique to every dialog sessions, which is time-bound (defaults to 15 minutes).  Ideal for remembering things specific to a conversation.
 *
 * -- CONTEXT --
 * In the global scope you have access to the @var event variable.
 *
 * -- PARAMETERS --
 * In the global scope you have access to the @var args object.
 * The @var args object is a key-value-pair of parameters defined when calling the action from the Flow Editor.
 *
 * -- ASYNC --
 * Actions can run asynchronously by returning a Promise.  If you want to use the `await` keyword, you need to declare an async function
 * and return a call to that function. @file `./builtin/getGlobalVariable.js` for a concrete example.
 *
 * -- REQUIRE MODULES --
 * You can require external modules by using `require('module-name')`.  A `node_modules` directory needs to be present next to the action
 * and the dependency needs to be present in this directory.  You can use npm/yarn inside the actions directory to manage dependencies.
 * Some modules are available by default such as axios and lodash
 *
 * -- REQUIRE FILES --
 * You can require adjacent .js and .json files, simply use `require('./path_to_file.js')`.  If the adjacent file is a .js file and is not intended to be an action in itself,
 * consider prefixing the file with a dot (.) so Botpress ignores it when looking for actions.
 *
 * -- METADATA --
 * You can change how the action will be presented in the Flow Editor by using JSDoc comments.  See example at the top of the file.
 */
const util = require('util');

const axios = require('axios');

console.log('Arguments =', util.inspect(args, false, 2, true));

if ('response' in temp) {
  // Mutate the `temp` object
  delete temp.url;
}

async function makeHttpRequest() {
  // args.url is an optional parameter that can be overwritten by the user in the Flow Editor
  const {
    data
  } = await axios.get(args.url || 'https://jsonplaceholder.typicode.com/users/1');
  temp.response = data;
} // Making an async HTTP request


return makeHttpRequest();