JSNES.Keyboard = function() {
    var i;

    this.keys = {
        KEY_A: 0,
        KEY_B: 1,
        KEY_SELECT: 2,
        KEY_START: 3,
        KEY_UP: 4,
        KEY_DOWN: 5,
        KEY_LEFT: 6,
        KEY_RIGHT: 7
    };

    this.state1 = new Array(8);
    this.state2 = new Array(8);
    this.state3 = new Array(8);
    this.state4 = new Array(8);

    for (i = 0; i < 8; i++) {
        this.state1[i] = 0x40;
        this.state2[i] = 0x40;
        this.state3[i] = 0x40;
        this.state4[i] = 0x40;
    }
};

JSNES.Keyboard.prototype = {
    setKey: function(key, value) {
        switch (key) {
            // Игрок 1 (как в оригинале)
            case 88: this.state1[this.keys.KEY_A] = value; break;      // X
            case 89: this.state1[this.keys.KEY_B] = value; break;      // Y (Central European)
            case 90: this.state1[this.keys.KEY_B] = value; break;      // Z
            case 17: this.state1[this.keys.KEY_SELECT] = value; break; // Right Ctrl
            case 13: this.state1[this.keys.KEY_START] = value; break;  // Enter
            case 38: this.state1[this.keys.KEY_UP] = value; break;     // Up
            case 40: this.state1[this.keys.KEY_DOWN] = value; break;   // Down
            case 37: this.state1[this.keys.KEY_LEFT] = value; break;   // Left
            case 39: this.state1[this.keys.KEY_RIGHT] = value; break;  // Right

            // Игрок 2 (NumPad)
            case 103: this.state2[this.keys.KEY_A] = value; break;     // Num-7
            case 105: this.state2[this.keys.KEY_B] = value; break;     // Num-9
            case 99:  this.state2[this.keys.KEY_SELECT] = value; break; // Num-3
            case 97:  this.state2[this.keys.KEY_START] = value; break;  // Num-1
            case 104: this.state2[this.keys.KEY_UP] = value; break;    // Num-8
            case 98:  this.state2[this.keys.KEY_DOWN] = value; break;   // Num-2
            case 100: this.state2[this.keys.KEY_LEFT] = value; break;  // Num-4
            case 102: this.state2[this.keys.KEY_RIGHT] = value; break; // Num-6

            // Игрок 3 — например, WASD + Q,E + Shift + Ctrl
            case 87: this.state3[this.keys.KEY_UP] = value; break;     // W
            case 83: this.state3[this.keys.KEY_DOWN] = value; break;   // S
            case 65: this.state3[this.keys.KEY_LEFT] = value; break;   // A
            case 68: this.state3[this.keys.KEY_RIGHT] = value; break;  // D
            case 81: this.state3[this.keys.KEY_SELECT] = value; break; // Q
            case 69: this.state3[this.keys.KEY_START] = value; break;  // E
            case 16: this.state3[this.keys.KEY_A] = value; break;      // Shift
            case 18: this.state3[this.keys.KEY_B] = value; break;      // Ctrl

            // Игрок 4 — например, IJKL + U,O + RightShift + RightCtrl
            case 73: this.state4[this.keys.KEY_UP] = value; break;     // I
            case 75: this.state4[this.keys.KEY_DOWN] = value; break;   // K
            case 74: this.state4[this.keys.KEY_LEFT] = value; break;   // J
            case 76: this.state4[this.keys.KEY_RIGHT] = value; break;  // L
            case 85: this.state4[this.keys.KEY_SELECT] = value; break; // U
            case 79: this.state4[this.keys.KEY_START] = value; break;  // O
            case 16: this.state4[this.keys.KEY_A] = value; break;      // Right Shift (учти, что код может совпадать с левым Shift)
            case 19: this.state4[this.keys.KEY_B] = value; break;      // Right Ctrl (тоже надо отдельно обрабатывать)

            default: return true;
        }
        return false; // preventDefault
    },

    keyDown: function(evt) {
        if (!this.setKey(evt.keyCode, 0x41) && evt.preventDefault) {
            evt.preventDefault();
        }
    },

    keyUp: function(evt) {
        if (!this.setKey(evt.keyCode, 0x40) && evt.preventDefault) {
            evt.preventDefault();
        }
    },

    keyPress: function(evt) {
        evt.preventDefault();
    }
};
