const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


const ixJsPath1 = path.join(__dirname, '../iX/server/.exported/js/');
const ixJsPath2 = path.join(__dirname, '../iX/scripts/js/');
const myJsPath1 = path.join(__dirname, 'scr/js/');
const myJsPath2 = path.join(__dirname, 'scripts/js/');
const ixCssPath1 = path.join(__dirname, '../iX/server/.exported/css/');
const ixCssPath2 = path.join(__dirname, '../iX/scripts/css/');
const myCssPath1 = path.join(__dirname, 'scr/css/');
const myCssPath2 = path.join(__dirname, 'scripts/css/');

const exec = (command) => {
  try {
    const message = execSync(command, {encoding: 'utf8'});
    console.log(message);
    return message;
  } catch (e) {
    console.error(e.stdout);
    return e.stdout;
  }
}

const walkdir = (_dir, type=1) => {
  _dir = path.resolve(_dir);
  const filepathList = [];
  for (const f of fs.readdirSync(_dir)) {
    const itemPath = path.join(_dir, f);
    const isDir = fs.statSync(itemPath).isDirectory();
    switch (type) {
      case 1: // files only
        if (isDir) filepathList.push(...walkdir(itemPath));
        else filepathList.push(itemPath);
        break;
      case 0: // files and dirs
        if (isDir) filepathList.push(...walkdir(itemPath));
        filepathList.push(itemPath);
        break;
      case 2: // dirs only
        if (isDir) filepathList.push(itemPath);
        else continue;
        break;
    }
  };
  return filepathList;
};

[myJsPath1, myJsPath2, myCssPath1, myCssPath2].forEach(p => {
  try{fs.rmSync(p, {recursive: true})}catch{};
});

const fetchScripts = (scriptsPath, savedPath) => {
  walkdir(scriptsPath).forEach(sourceFilepath => {
    if (/[\/\\]admin[\/\\]/i.test(sourceFilepath)) return;
    const oFilepath1 = sourceFilepath.replace(scriptsPath, savedPath);
    const oDirname1 = path.dirname(oFilepath1);
    if (!fs.existsSync(oDirname1)) fs.mkdirSync(oDirname1, {recursive: true});
    fs.copyFileSync(sourceFilepath, oFilepath1);
    console.log('copied:', sourceFilepath);
  });
}

fetchScripts(ixJsPath1, myJsPath1);
fetchScripts(ixJsPath2, myJsPath2);
fetchScripts(ixCssPath1, myCssPath1);
fetchScripts(ixCssPath2, myCssPath2);

exec(`git pull`);
exec(`git add .`);
exec(`git commit -am "updated\nupdated"`);
exec(`git push`);

console.log('Done.');