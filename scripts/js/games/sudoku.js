// 來自 chee 的函數

const copyObj = (map) => {
  return JSON.parse(JSON.stringify(map));
}

const choices = (array, amount=1) => {
  const result = [];
  array = [...array];
  for (let i = 0; i < amount; i++) {
    if (!array.length) break;
    result.push(array.splice(Math.floor(Math.random()*array.length), 1)[0]);
  };
  return result;
}

const shuffle = (array) => {
  return choices(array, array.length);
}

const range = (a=null, b=null, c=null) => {
  const numbers = [];
  if      (!(a===null) &&  (b===null) &&  (c===null)) for (let i = 0; i < a; i++) numbers.push(i);  // 只有 a
  else if (!(a===null) && !(b===null) &&  (c===null)) for (let i = a; i < b; i++) numbers.push(i);  // 只有 a 和 b
  else if (!(a===null) && !(b===null) && !(c===null)) for (let i = a; i < b; i+=c) numbers.push(i); // 有 a b c
  return numbers;
}


class Sudoku {
  constructor (legalNumbers=[1,2,3,4,5,6,7,8,9]) {
    this.legalNumbers = legalNumbers;
    this.side = this.legalNumbers.length;
    this.size = Math.pow(this.side, 0.5);
  }

  checkList (numberList=[]) {
    const testRecord = {};
    for (const i of numberList) {
      if (i === null || i === undefined || i === '') continue;
      if (this.legalNumbers.indexOf(i) == -1) return false;
      if (testRecord[i]) return false;
      else testRecord[i] = true;
    }
    return true;
  }

  checkMap (map) {
    const size = map.length;
    const squares = [];
    // 生成所有的方塊組
    for (const i of range(size*size/9)) squares.push([]);
    // 檢查每行每列
    for (const i of range(size)) {
      const _row = [], _col = [];
      for (const j of range(size)) {
        _row.push(map[i][j]), _col.push(map[j][i]);
        squares[((Math.ceil((i+0.1)/3)))*3+Math.ceil((j+0.1)/3)-4].push(map[i][j]);
        // 最後一個 -4 是簡化 (-1*3)+(-1)
      }
      if (!this.checkList(_row)) return false;
      if (!this.checkList(_col)) return false;
    }
    // 檢查每個小九宮格方塊組
    for (const square of squares) if (!this.checkList(square)) return false;
    return true;
  }
  
  drawMap (_map) {
    const map = copyObj(_map);
    for (const i of range(map.length)) {
      for (const j of range(map.length)) if (map[i][j] === null) map[i][j] = ' ';
      map[i] = map[i].join(' ');
    }
    return map.join('\n');
  }

  generateMap () {
    const t0 = new Date().getTime();
    const __generateMap = (_gameSize=3) => {
      const size = _gameSize * _gameSize;
      const map = [];
      if (_gameSize != 3) throw '"size" can only be equal to 3.';
      for (const i of range(size)) {
        const row = [];
        for (const j of range(size)) row.push(null);
        map.push(row);
      }
      for (const i of range(size)) {
        for (const j of range(size)) {
          const testingNumbers = shuffle(this.legalNumbers);
          let checked = false;
          for (const num of testingNumbers) {
            map[i][j] = num;
            if (this.checkMap(map)) {
              checked = true;
              break;
            }
          }
          if (!checked) {
            throw 'Generating error';
          }
        }
      }
      return map;
    }
    let err = 0;
    while (true) {
      try {
        const map = __generateMap();
        console.log(`Successfully generated a Sudoku map after ${err+1} attempts (${(((new Date).getTime()-t0)/1000).toFixed(2)}s):\n${this.drawMap(map)}`);
        return map;
      }
      catch {err++}
    }
  }

  buildSquare (_arr, squareSide=3) {
    const square = [];
    while (_arr.length) square.push(_arr.splice(0, squareSide));
    return square;
  }

  squaresMakeMap (squares) {
    const gameSize = Math.pow(squares.length, 0.5);
    const mapSide = gameSize * 3;
    const map = [];
    const _3 = (v) => {let w=v;while(w>2)w-=3;return w};
    for (const r of range(mapSide)) map.push(range(mapSide));
    for (const r of range(mapSide)) {
      for (const c of range(mapSide)) {
        map[r][c] = squares[3*(Math.ceil(r/3+0.1)-1)+(Math.ceil(c/3+0.1)-1)][_3(r)][_3(c)];
      }
    }
    return map;
  }

  maskMap (_map) {
    const t0 = new Date().getTime();
    const __maskSquare = (_square, amount=1) => {
      const expandedSquare = copyObj(_square).flat(Infinity);
      while (amount) {
        const maskIndex = choices(range(expandedSquare.length));
        if (expandedSquare[maskIndex] != null) {
          expandedSquare[maskIndex] = null;
          amount--;
        }
      }
      return this.buildSquare(expandedSquare);
    }
    const map = copyObj(_map);
    const size = map.length / 3;
    const squares = [];
    // 獲得所有小九宮格，同 checkMap 函數的算法
    for (const i of range(size*size)) squares.push([]);
    for (const i of range(map.length)) {
      for (const j of range(map.length)) {
        squares[((Math.ceil((i+0.1)/3)))*3+Math.ceil((j+0.1)/3)-4].push(map[i][j]);
      }
    }
    const promptCells = Math.round(0.21 * map.length * map.length)
    const maskedCells = map.length * map.length - promptCells;
    let _maskedCells = maskedCells;
    while (_maskedCells > 0) {
      const maskOrder = _maskedCells>squares.length?range(squares.length):shuffle(range(squares.length));
      while (maskOrder.length && _maskedCells--) {
        const squareIndex = maskOrder.pop();
        squares[squareIndex] = __maskSquare(squares[squareIndex]);
      }
    }
    const maskedMap = this.squaresMakeMap(squares)
    console.log(`Masked ${maskedCells} numbers with ${promptCells} prompt numbers (${(((new Date).getTime()-t0)/1000).toFixed(2)}s):\n${this.drawMap(maskedMap)}`);
    return maskedMap;
  }
}

const sudoku = new Sudoku();

window.onload = () => {
  setTimeout(() => {
    const map = sudoku.generateMap();
    const maskedMap = sudoku.maskMap(map);
  }, 100);
};