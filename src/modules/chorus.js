(function(T) {
    "use strict";
    
    function Chorus(samplerate) {
        this.samplerate = samplerate;
        
        var bits = Math.round(Math.log(samplerate * 0.1) * Math.LOG2E);
        this.buffer = new Float32Array(1 << bits);
        
        this.wave       = null;
        this._wave      = null;
        this.writeIndex = this.buffer.length >> 1;
        this.readIndex  = 0;
        this.delayTime  = 20;
        this.rate       = 4;
        this.depth      = 20;
        this.feedback   = 0.2;
        this.wet        = 0.5;
        this.phase      = 0;
        this.phaseIncr  = 0;
        this.phaseStep  = 4;
        
        this.setWaveType("sin");
        this.setDelayTime(this.delayTime);
        this.setRate(this.rate);
    }
    
    var $ = Chorus.prototype;
    
    var waves = [];
    waves[0] = (function() {
        var wave = new Float32Array(256);
        for (var i = 256; i--; ) {
            wave[i] = Math.sin(2 * Math.PI * (i/256));
        }
        return wave;
    })();
    waves[1] = (function() {
        var wave = new Float32Array(256);
        for (var x, i = 256; i--; ) {
            x = (i / 256) - 0.25;
            wave[i] = 1.0 - 4.0 * Math.abs(Math.round(x) - x);
        }
        return wave;
    })();
    
    $.setWaveType = function(waveType) {
        if (waveType === "sin") {
            this.wave = waveType;
            this._wave = waves[0];
        } else if (waveType === "tri") {
            this.wave = waveType;
            this._wave = waves[1];
        }
    };
    
    $.setDelayTime = function(delayTime) {
        this.delayTime = delayTime;
        var readIndex = this.writeIndex - ((delayTime * this.samplerate * 0.001)|0);
        while (readIndex < 0) {
            readIndex += this.buffer.length;
        }
        this.readIndex = readIndex;
    };
    
    $.setRate = function(rate) {
        this.rate      = rate;
        this.phaseIncr = (256 * this.rate / this.samplerate) * this.phaseStep;
    };
    
    $.process = function(cell) {
        var buffer = this.buffer;
        var size   = buffer.length;
        var mask   = size - 1;
        var wave       = this._wave;
        var phase      = this.phase;
        var phaseIncr  = this.phaseIncr;
        var writeIndex = this.writeIndex;
        var readIndex  = this.readIndex;
        var depth      = this.depth;
        var feedback   = this.feedback;
        var x, index, mod;
        var wet = this.wet, dry = 1 - wet;
        var i, imax = cell.length;
        var j, jmax = this.phaseStep;
        
        for (i = 0; i < imax; ) {
            mod = wave[phase|0] * depth;
            phase += phaseIncr;
            while (phase > 256) {
                phase -= 256;
            }
            for (j = 0; j < jmax; ++j, ++i) {
                index = (readIndex + size + mod) & mask;
                x = buffer[index];
                buffer[writeIndex] = cell[i] - x * feedback;
                cell[i] = (cell[i] * dry) + (x * wet);
                writeIndex = (writeIndex + 1) & mask;
                readIndex  = (readIndex  + 1) & mask;
            }
        }
        this.phase = phase;
        this.writeIndex = writeIndex;
        this.readIndex  = readIndex;
        
        return cell;
    };
    
    T.modules.Chorus = Chorus;
    
})(timbre);
