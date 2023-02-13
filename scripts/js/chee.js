win.chee={"version":"0.41.23.20230212.842b05f.alpha","config":{"appname":"IX","sessName":"ix-sess","minifiedCodes":1,"runDcBot":1},"valid":{"unique":(arr) => [...new Set(arr)],"capitalize":function(str) {
      return str.charAt(0).toUpperCase() + str.slice(1);
    },"__testStr":function(str, minLength, maxLength, validReg, name, throwInvalidChars=true) {
      name = name.toLowerCase() || 'string';
      const _name = ix.chee.valid.capitalize(name);
      if (!str) throw `${_name} cannot be empty.`;
      if (str.length < minLength) throw `${_name} must have at least ${minLength} characters.`;
      if (str.length > maxLength) throw `The length of the ${name} cannot be greater than ${maxLength}.`;
      const regex = validReg;
      const result = str.match(regex);
      if (result != null) return true;
      if (!throwInvalidChars) throw `${_name} does not conform to the format.`;
      const negatedRegex = new RegExp('[^' + regex.source.slice(1, -1) + ']', 'g');
      const invalidChars = ix.chee.valid.unique(str.match(negatedRegex));
      throw `The ${name} cannot contain the following characters:\n${invalidChars.join(', ')}`;
    },"__isStrType":(str, testFunc) => {
      try {return testFunc(str)} catch {return false}
    },"testEmail":(str) => ix.chee.valid.__testStr(String(str).toLowerCase(), 5, 320, /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/, 'email address', false),"testUsername":(str) => ix.chee.valid.__testStr(str, 5, 32, /^[a-zA-Z0-9_]+$/, 'username'),"testPasswd":(str) => ix.chee.valid.__testStr(str, 8, 64, /^[a-zA-Z0-9`~!@#$%^&*()-_=+[{\]}|;:'",<.>/?]+$/, 'password'),"isEmail":(str) => ix.chee.valid.__isStrType(str, ix.chee.valid.testEmail),"isUsername":(str) =>ix.chee.valid. __isStrType(str, ix.chee.valid.testUsername),"isPasswd":(str) => ix.chee.valid.__isStrType(str, ix.chee.valid.testPasswd)},"range":(a=null, b=null, c=null) => {
    const numbers = [];
    if      (!(a===null) &&  (b===null) &&  (c===null)) for (let i = 0; i < a; i++) numbers.push(i);  // 只有 a
    else if (!(a===null) && !(b===null) &&  (c===null)) for (let i = a; i < b; i++) numbers.push(i);  // 只有 a 和 b
    else if (!(a===null) && !(b===null) && !(c===null)) for (let i = a; i < b; i+=c) numbers.push(i); // 有 a b c
    return numbers;
  },"time":{"new":() => {
    return new Date();
  },"stamp":function() {
    return new Date().getTime();
  },"format":(date, format='yyyy/MM/dd HH:mm:ss', utc) => { 
    if (!(date instanceof Date)) date = date ? new Date(date) : new Date();
    if (!format) format;
    const addLeadingZeros = (val, len = 2) => val.toString().padStart(len, '0');
    const dateProperties = utc ?
      {
        y: date.getUTCFullYear(),
        M: date.getUTCMonth() + 1,
        d: date.getUTCDate(),
        w: date.getUTCDay(),
        H: date.getUTCHours(),
        m: date.getUTCMinutes(),
        s: date.getUTCSeconds(),
        f: date.getUTCMilliseconds()
      } :
      {
        y: date.getFullYear(),
        M: date.getMonth() + 1,
        d: date.getDate(),
        w: date.getDay(),
        H: date.getHours(),
        m: date.getMinutes(),
        s: date.getSeconds(),
        f: date.getMilliseconds()
      };
    const T = dateProperties.H < 12 ? 'AM' : 'PM';
    const h = dateProperties.H % 12 || 12;
    return format
      .replace(/yyyy/g, dateProperties.y)
      .replace(/yy/g, dateProperties.y.toString().substr(2, 2))
      .replace(/y/g, dateProperties.y)
      .replace(/MMMM/g, ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'][dateProperties.M - 1])
      .replace(/MMMM/g, ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][dateProperties.M - 1])
      .replace(/MM/g, addLeadingZeros(dateProperties.M))
      .replace(/M/g, dateProperties.M)
      .replace(/dddd/g, ['Sunday', 'Monday', 'Tuesday', 'Wednesday',
        'Thursday', 'Friday', 'Saturday'][dateProperties.w])
      .replace(/ddd/g, ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][dateProperties.w])
      .replace(/dd/g, addLeadingZeros(dateProperties.d))
      .replace(/d/g, dateProperties.d)
      .replace(/HH/g, addLeadingZeros(dateProperties.H))
      .replace(/H/g, dateProperties.H)
      .replace(/hh/g, addLeadingZeros(h))
      .replace(/h/g, h)
      .replace(/mm/g, addLeadingZeros(dateProperties.m))
      .replace(/m/g, dateProperties.m)
      .replace(/ss/g, addLeadingZeros(dateProperties.s))
      .replace(/s/g, dateProperties.s)
      .replace(/fff/g, addLeadingZeros(dateProperties.f, 3))
      .replace(/ff/g, addLeadingZeros(Math.round(dateProperties.f / 10)))
      .replace(/f/g, Math.round(dateProperties.f / 100))
      .replace(/TT/g, T)
      .replace(/T/g, T.charAt(0));
  }},"escapeString":(str) => JSON.stringify(str).slice(1, -1),"trimObj":(obj) => {
    if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) if (typeof obj === 'object') obj[i] = trimObj(obj[i]);
    } else {
      for (const i in obj) {
        if (obj[i] === undefined || obj[i] === null || obj[i] === NaN) delete obj[i];
      }
    }
    return obj;
  },"base":{"chars":{"2":"01","10":"0123456789","16":"0123456789abcdef","36":"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ","64":"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_"},"__b10toBx":function(number, base) {
      const result = [], baseChars = ix.chee.base.chars[base];
      number = Math.round(number);
      while (number / base > 0) {
        const n = number % base;
        number = (number - n) / base;
        result.push(baseChars[n]);
      }
      return result.reverse().join('') || baseChars[0];
    },"b10toB64":(number) => ix.chee.base.__b10toBx(number, 64),"b64toB10":(string) => {
      let result = 0;
      string = string.split('').reverse().join('');
      for (let i = 0; i < string.length;) {
        result += (ix.chee.base.chars['64'].indexOf(string[i])) * Math.pow(64, i++);
      }
      return result;
    }},"random":{"int":(start, end) => {
      if (!end) end = start, start = 0;
      return Math.floor(start + Math.random() * (end + 1));
    },"_base":(len, base) => {
      const arr = [];
      for (let i = 0; i < len; i ++) arr.push(ix.chee.base.chars[`${base}`][Math.floor(Math.random()*base)]);
      return arr.join('');
    },"base2":(len = 16) => ix.chee.random._base(len, 2),"base10":(len = 6) => ix.chee.random._base(len, 10),"base16":(len = 8) => ix.chee.random._base(len, 16),"base64":(len = 8) => ix.chee.random._base(len, 64),"choices":(_array, amount=1) => {
      const result = [];
      let array = [];
      for (let i = 0; i < amount; i++) {
        if (!array.length) array = new Array(..._array);
        const item = array.splice(Math.floor(Math.random() * array.length), 1);
        result.push(item[0]);
      };
      return result;
    },"choice":(array) => array[Math.floor(Math.random()*array.length)],"shuffle":(array) => {
      return ix.chee.random.choices(array, array.length);
    },"mt":null},"formatBytes":(fileSizeByte=0, toFix=2) => {
    const d = parseInt(Math.log(fileSizeByte) / Math.log(1024))||0;
    return `${(fileSizeByte/Math.pow(1024, d>5?5:d)).toFixed(toFix)} ${['','K','M','G','T','P'][d>5?5:d]}B`;
  }};