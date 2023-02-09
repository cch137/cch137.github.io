const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');


const ixJsPath1 = path.join(__dirname, '../iX/server/.minified/js/');
const ixJsPath2 = path.join(__dirname, '../iX/scripts/js/');
const myPath1 = path.join(__dirname, 'scr/js/');
const myPath2 = path.join(__dirname, 'scripts/js/');

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

try{fs.rmdirSync(myPath1, {recursive: true})}catch{};
try{fs.rmdirSync(myPath2, {recursive: true})}catch{};

walkdir(ixJsPath1).forEach(sourceFilepath => {
  const oFilepath1 = sourceFilepath.replace(ixJsPath1, myPath1);
  const oDirname1 = path.dirname(oFilepath1);
  if (!fs.existsSync(oDirname1)) fs.mkdirSync(oDirname1, {recursive: true});
  fs.copyFileSync(sourceFilepath, oFilepath1);
  console.log('copied:', sourceFilepath);
});

walkdir(ixJsPath2).forEach(sourceFilepath => {
  const oFilepath2 = sourceFilepath.replace(ixJsPath2, myPath2);
  const oDirname2 = path.dirname(oFilepath2);
  if (!fs.existsSync(oDirname2)) fs.mkdirSync(oDirname2, {recursive: true});
  fs.copyFileSync(sourceFilepath, oFilepath2);
  console.log('copied:', sourceFilepath);
});

exec(`git pull`);
exec(`git add .`);
exec(`git commit -am "updated"`);
exec(`git push`);

console.log('Done.');