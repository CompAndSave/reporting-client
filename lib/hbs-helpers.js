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


exports.length = function (obj) {
    if (typeof obj === "string" || Array.isArray(obj)) { return obj.length; }
    if (typeof obj === "object") { return Object.keys(obj).length; }
    return null;
};


exports.concat = function () {
  let params = [...arguments].slice(0, -1);
  return [...params].join('');
}

exports.JSONparse = function (str) {
  return JSON.parse(str);
}

exports.numberWithCommas = function(num){
  return num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

exports.formatMoney = function(num){
  return "$" + num.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ",");
}

exports.includeString = function(data, text) {
  let str = data.toString();
  return (str.indexOf(text) !== -1);
}

exports.numToQuarter = function(num){
  let quarterNum = parseInt(num);
  let quarters = ["Q1", "Q2", "Q3", "Q4"];  
  return quarters[quarterNum-1];         
}

exports.numToMonth = function(num, short = false){
  let monthNum = parseInt(num);
  let months = [ "January", "February", "March", "April", "May", "June", 
           "July", "August", "September", "October", "November", "December" ];
  let monthsShort = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", 
           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];   
  if(short){
    return monthsShort[monthNum-1];
  }        
  return months[monthNum-1];         
}