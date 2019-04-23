  /* https://developer.mozilla.org/en-US/docs/Web/API/TextEncoder  */
  /* https://stackoverflow.com/questions/12075927/serialization-of-regexp */
const self = module.exports = {
  __wrap__: (obj) => {
    var key, value;
    for (key in obj) {
      value = obj[key];
      if (value !== null && value instanceof RegExp) {
        obj[key] = ("__REGEXP " + value.toString());
      } else if (typeof value === 'object') {
        self.__wrap__(value);
      }
    }
  },
  __unwrap__: (obj) => {
    var key, value;
    for (key in obj) {
      value = obj[key];
      if (value !== null && typeof value === 'object') {
        self.__unwrap__(value);
      } else if (typeof value === 'string') {
        if (value.match(/^(\d){4}-(\d){2}-(\d){2}T(\d){2}:(\d){2}:(\d){2}/i)) {
          obj[key] = new Date(Date.parse(value));
        } else if (value.indexOf("__REGEXP ") == 0) {
          var m = value.split("__REGEXP ")[1].match(/\/(.*)\/(.*)?/);
          obj[key] = new RegExp(m[1], m[2] || "");
        }
      }
    }
  }
};