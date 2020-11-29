'use strict'

exports.toLowerCase = function (msg) {
  msg = msg.toString()
  return msg.toLowerCase()
}

exports.toUpperCase = function (msg) {
  msg = msg.toString()
  return msg.toUpperCase()
}

exports.toString = function (msg) {
  return msg.toString()
}


exports.replace = function(text, pattern, replacement) {
  text = text.toString()
  return text.replace(new RegExp(pattern, "g"), replacement)
}

exports.isArray = function(data) {
  return Array.isArray(data)
}

exports.repeatUntil = function (startIndex, lastIndex, item) {
    let content = ''
    while (++startIndex < lastIndex) {
        content += item.fn(startIndex)
    }
    return content
}

exports.join = function (elements, separator) {
  return elements.join(separator)
}

exports.math = function (a,operator,b) {
  switch (operator) {
    case '+':
    case 'plus':
      return a + b

    case '-':
    case 'minus':
      return a - b

    case '*':
    case 'times':
      return a * b

    case '/':
    case 'divide':
      return a / b

    case '%':
    case 'mod':
      return a % b
      
    default:
      return false
      
  }
}

exports.compare = function (a, operator, b) {
  switch (operator) {
    case "==":
    case "eq":
      return a == b

    case "===":
      return a === b

    case "!=":
    case "neq":
      return a != b

    case "!==":
      return a !== b

    case "lt":
    case "<":
      return a < b

    case "lte":
    case "<=":
      return a <= b

    case "gt":
    case ">":
      return a > b

    case "gte":
    case ">=":
      return a >= b

    default:
      return false
  }
}

exports.condition = function(a, operator, b){
  switch (operator) {
    case '&&':
    case 'AND':
      return a && b

    case '||':
    case 'OR':
      return a || b
    
    default:
      return false
  }
}


exports.length = function (array) {
    if (util.isObject(array) && !util.isOptions(array)) {
        value = Object.keys(array);
    }
    if (typeof value === 'string' || Array.isArray(array)) {
        return value.length;
    }
    return 0;
};


exports.concat = function () {
  let params = [...arguments].slice(0, -1);
  return [...params].join('');
}

exports.JSONparse = function (str, options) {
  return JSON.parse(str);
}