/*jshint esnext: true */


//Note labyrinth X Y are swapped!
//Syntax highlighting?
//Bigint library!
//https://github.com/peterolson/BigInteger.js

//Use: https://developers.google.com/web/updates/2014/05/Web-Animations-element.animate-is-now-in-Chrome-36
//Save option 
//a => ASCII code

if(localStorage["code"] !== undefined) lab.innerHTML = localStorage["code"];

var p; //pointer
var labyrinth; //code
var main, auxiliary; //stacks, main.length-1=top
var direction; //N=0,E=1,S=2,W=3;
var inpLoc;
var sucide;
var step;
var debug;

var spiders = false;

var pointerIcons = ["▲", "►", "▼", "◄", "X"];

var commandExplanation = {
   "\"": "No op",
   "\'": "No op",
   "@": "Exit",

   //Mathemagic
   "_": "Push 0",
   "0": "0",
   "1": "1",
   "2": "2",
   "3": "3",
   "4": "4",
   "5": "5",
   "6": "6",
   "7": "7",
   "8": "8",
   "9": "9",
   ")": "Increment",
   "(": "Decrement",
   "+": "Add",
   "-": "Subtract",
   "*": "Multiply",
   "/": "Divide",
   "%": "Modulo",
   "`": "Multiply by -1",
   "&": "Bitwise AND",
   "|": "Bitwise OR",
   "$": "Bitwise XOR",
   "~": "Bitwise NOT",

   //Stack manipulation
   ":": "Duplicate",
   ";": "Remove",
   "}": "Move to aux stack",
   "{": "Move to main stack",
   "=": "Swap stack tops",
   "#": "Depth of stack",

   //I/O
   ",": "Read",
   "?": "Read number",
   ".": "Print",
   "!": "Print number",
   "\\": "\\n",

   //Grid manipulation
   ">": "Shift row right",
   "<": "Shift row left",
   "^": "Shift column up",
   "v": "Shift column down"
};

function mod(x, y) {
   return ((x % y) + y) % y;
}

Array.prototype.top = function() {
   if (this.length === 0) {
      return 0;
   }
   return this[this.length - 1];
};

Array.prototype._pop = Array.prototype.pop;
Array.prototype.pop = function(x) {
   var temp = this._pop();
   return temp !== undefined ? temp : 0;
};

function reset() {
   p = [0, 0];
   labyrinth = lab.innerHTML.replace(/\[/g, " ").replace(/\]/g, " ").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\n*$|(<br>)*$/, "").split(/<br>|\n/g);
   //Pad labyrinth
   var maxLength = 0;
   for (var i = 0; i < labyrinth.length; i++) {
      if (maxLength < labyrinth[i].length)
         maxLength = labyrinth[i].length;
   }

   //Labyrinth to char array
   for (i = 0; i < labyrinth.length; i++) {
      labyrinth[i] = (labyrinth[i] + " ".repeat(maxLength - labyrinth[i].length)).split("");
   }

   //Pointer pos
   loop:
      for (i = 0; i < labyrinth.length; i++) {
         for (j = 0; j < labyrinth[i].length; j++) {
            if (labyrinth[i][j] !== " ") {
               p = [j, i];
               break loop;
            }
         }
      }

   main = [];
   auxiliary = [];
   direction = 1;
   sucide = false;
   inpLoc = 0;
   step = 1;
   output.value = "";
}

function run() {
   reset();
   localStorage["code"] = lab.innerHTML;
   
   
   lab.contentEditable = false;
   if (debug) {
      showDebugOutput();
   }

   //Start if it contains any code
   var containsCode = lab.innerHTML.replace(/\[/g, "").replace(/\]/g, "").replace(/<br>|\n/g, "") !== "";
   if (containsCode) {
      if (!debug) {
         while (!sucide) {
            updatePointer();
         }
         showDebugOutput();
         stop();
      }
   } else {
      stop();
   }
}

function stop() {
   if (debug) stopDebug();

   sucide = true;
   lab.contentEditable = "true";
}

function updatePointer() {
   if (sucide) {
      stepButton.disabled = "disabled";
      lab.contentEditable = "true";
      pointerOverlay.innerHTML = "";
      showDebugOutput();
      return -1; //End
   }
   stepDiv.innerHTML = step;
   step++;
   execChar(labyrinth[p[1]][p[0]]);


   var ret = updateDirection();
   //If there are walls
   if (ret != -1) {
      direction = mod(direction, 4);

      if (direction === 0) {
         p[1] --;
      } else if (direction == 1) {
         p[0] ++;
      } else if (direction == 2) {
         p[1] ++;
      } else if (direction == 3) {
         p[0] --;
      }
   }

   if (debug) {
      showDebugOutput(ret);
   }

}

function showDebugOutput(ret) {
   var command = labyrinth[p[1]][p[0]];
   debugOutput.value =
      "Pointer: " + p +
      "\nCommand: " + command + "   " + commandExplanation[command] +
      "\nMain [" + main + " | " + auxiliary.slice().reverse() + "] Auxiliary";

   pointerOverlay.innerHTML = "\n".repeat(p[1]) + " ".repeat(p[0]) + (pointerIcons[ret == -1 ? 4 : direction]);
}

function updateGrid() {
   lab.innerHTML = "";
   labyrinth.forEach(s => lab.innerHTML += s.join("") + "\n");
}

function rotVert(rotWhich) {
   var temp;
   for (var i = 0; i < labyrinth.length; i++) {
      if (i === 0) {
         temp = labyrinth[0][rotWhich];
      }
      if (i == labyrinth.length - 1) {
         labyrinth[i][rotWhich] = temp;
      } else {
         labyrinth[i][rotWhich] = labyrinth[i + 1][rotWhich];
      }
      if (labyrinth[i][rotWhich] === undefined) {
         labyrinth[i].splice(rotWhich, 1);
      }
   }
}

function rotVert2(rotWhich) {
   var temp;
   for (var i = labyrinth.length - 1; i >= 0; i--) {
      if (i == labyrinth.length - 1) {
         temp = labyrinth[i][rotWhich];
      }
      if (i === 0) {
         labyrinth[i][rotWhich] = temp;
      } else {
         labyrinth[i][rotWhich] = labyrinth[i - 1][rotWhich];
      }
      if (labyrinth[i][rotWhich] === undefined) {
         labyrinth[i].splice(rotWhich, 1);
      }
   }
}

function dirToX(dir) {
   return [-1, 0, 1, 0][mod(dir, 4)];
}

function dirToY(dir) {
   return [0, 1, 0, -1][mod(dir, 4)];
}

function lookAt(dir) {
   try {
      return labyrinth[p[1] + dirToX(dir)][p[0] + dirToY(dir)];
   } catch (e) {
      return " ";
   }
}

function isWall(d) {
   if (lookAt(d) == " " || lookAt(d) === undefined) {
      return true;
   } else {
      return false;
   }
}

function updateDirection() {
   var numOfPaths = 0;
   for(var i = 0; i < 4; i++) {
      if (!isWall(i)) numOfPaths++;
   }


   if (numOfPaths == 4) {
      if (main.top() < 0) {
         direction -= 1;
      } else if (main.top() > 0) {
         direction += 1;
      }
   } else if (numOfPaths == 3) {
      if (main.top() < 0) {
         direction -= 1;
      } else if (main.top() > 0) {
         direction += 1;
      }
      if (isWall(direction)) {
         direction += 2;
      }
   } else if (numOfPaths == 2) {
      if (isWall(direction + 2)) {
         if (isWall(direction)) {
            //Special case
            if (main.top() < 0) {
               direction -= 1;
            } else if (main.top() > 0) {
               direction += 1;
            } else {
               direction += Math.random() < 0.5 ? -1 : 1;
            }
         } else {
            //Keep moving..
         }
      } else {
         for (var i = 0; i <= 3; i++) {
            if (!isWall(i) && i != mod((direction + 2), 4)) {
               direction = i;
               break;
            }
         }
      }
   } else if (numOfPaths == 1) {
      if (!isWall(0)) {
         direction = 0;
      } else
      if (!isWall(1)) {
         direction = 1;
      } else
      if (!isWall(2)) {
         direction = 2;
      } else
      if (!isWall(3)) {
         direction = 3;
      }
   } else {
      return -1;
   }
}

function execChar(char) {
   var a;
   var b;
   if (/\d/.exec(char)) {
      main.push(main.pop() * 10 + (+char));
   } else switch (char) {
      case '!':
         output.value += main.pop();
         break;
      case '"': //Nothing...
         break;
      case '#':
         main.push(main.length);
         break;
      case '$':
         main.push(main.pop() ^ main.pop());
         break;
      case '%':
         a = main.pop();
         b = main.pop();
         main.push(mod(b, a));
         break;
      case '&':
         main.push(main.pop() & main.pop());
         break;
      case "'":
         //Debug-Unimplemented
         break;
      case '(':
         main.push(main.pop() - 1);
         break;
      case ')':
         main.push(main.pop() + 1);
         break;
      case '*':
         main.push(main.pop() * main.pop());
         break;
      case '+':
         main.push(main.pop() + main.pop());
         break;
      case ',':
         a = input.value.charCodeAt(inpLoc);
         if (Number.isNaN(a)) {
            main.push(-1);
         } else {
            main.push(a);
            inpLoc++;
         }
         break;
      case '-':
         a = main.pop();
         b = main.pop();
         main.push(b - a);
         break;
      case '.':
         output.value += String.fromCharCode(mod(main.pop(), 256));
         break;
      case '/':
         a = main.pop();
         b = main.pop();
         if (a === 0) {
            stop();
            throw "Stop that";
         }
         main.push(Math.floor(b / a));
         break;
      case ':':
         main.push(main.top());
         break;
      case ';':
         main.pop();
         break;
      case '<':
         //MOVE IP
         b = main.pop();
         a = mod(p[1] + b, labyrinth.length);
         labyrinth[a].push(labyrinth[a].shift());
         updateGrid();
         if (b === 0) {
            p[0] = mod(p[0] - 1, labyrinth[a].length);
         }
         break;
      case '=':
         a = main.pop();
         b = auxiliary.pop();
         main.push(b);
         auxiliary.push(a);
         break;
      case '>':
         //MOVE IP
         b = main.pop();
         a = mod(p[1] + b, labyrinth.length);
         labyrinth[a].unshift(labyrinth[a].pop());
         updateGrid();
         if (b === 0) {
            p[0] = mod(p[0] + 1, labyrinth[a].length);
         }
         break;
      case '?':
         try {
            a = input.value.substr(inpLoc);
            b = (+(/[\+-]?\d+/.exec(a)[0]));
            main.push(b);
            inpLoc += a.search(/[\+-]?\d+/) + (b + "").length;
         } catch (e) {
            main.push(0);
            inpLoc = input.value.length;
         }
         break;
      case '@':
         stop();
         break;
      case '\\':
         output.value += "\n";
         break;
      case '^': //Fix!
         b = main.pop();
         labyrinth = transpose(labyrinth);
         a = mod(p[0] + b, labyrinth[p[1]].length);
         labyrinth[a].unshift(labyrinth[a].pop());
         if (b === 0) {
            p[1] = mod(p[1] - 1, labyrinth.length);
         }
         labyrinth = transpose(labyrinth);
         updateGrid();
         break;
      case '_':
         main.push(0);
         break;
      case '`':
         main.push(-main.pop());
         break;
      case 'v': //Fix!
         b = main.pop();
         a = mod(p[0] + b, labyrinth[p[1]].length);
         rotVert2(a);
         updateGrid();
         if (b === 0) {
            p[1] = mod(p[1] + 1, labyrinth.length);
         }
         break;
      case '{':
         main.push(auxiliary.pop());
         break;
      case '|':
         main.push(main.pop() | main.pop());
         break;
      case '}':
         auxiliary.push(main.pop());
         break;
      case '~':
         main.push(~main.pop());
         break;
   }
}

function transpose(array) {
   var newArray = array[0].map(function(col, i) {
      return array.map(function(row) {
         return row[i];
      });
   });
   return newArray;
}




function toggleDebug() {
   if (debug) {
      stopDebug();
   } else {
      startDebug();
   }
}

function startDebug() {
   debug = true;
   debugButtonText.innerHTML = "Stop";
   debugOutput.style.display = 'flex';
   debugHeader.style.display = 'flex';

   stepButton.disabled = false;

   run();
}

function stopDebug() {
   debug = false;
   stop();
   debugButtonText.innerHTML = "Debug";
   debugOutput.style.display = 'none';
   debugHeader.style.display = 'none';

   stepButton.disabled = "disabled";

   updatePointer();
}

//Maze proper copy
lab.addEventListener("paste", function(e) {
   // cancel paste
   e.preventDefault();

   // get text representation of clipboard
   var text = e.clipboardData.getData("text/plain");


   lab.innerHTML += text;
});

lab.addEventListener("input", function(e) {
	localStorage["code"] = lab.innerHTML;
});