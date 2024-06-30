// Bun has an compatibility issue with drizzlekit
// It is caused by Object.keys not working on buns `Module` class
/* eslint-disable */
const schema = require('./schema');

// @ts-ignore
Object.keys(schema.__proto__).forEach(key => {
  // @ts-ignore
  exports[key] = schema[key];
});
