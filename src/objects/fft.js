(function(T) {
    "use strict";
    
    var fn  = T.fn;
    var FFT = T.modules.FFT;
    
    function FFTNode(_args) {
        T.Object.call(this, _args);
        fn.listener(this);
        fn.stereo(this);
        fn.fixAR(this);
        
        this.real = this.L;
        this.imag = this.R;
        
        this._.fft = new FFT(T.cellsize * 2);
        this._.fftCell  = new Float32Array(this._.fft.length);
        this._.prevCell = new Float32Array(T.cellsize);
        
        this._.plotFlush = true;
        this._.plotRange = [0, 1];
        this._.plotBarStyle = true;
    }
    fn.extend(FFTNode);
    
    var $ = FFTNode.prototype;
    
    Object.defineProperties($, {
        window: {
            set: function(value) {
                this._.fft.setWindow(value);
            },
            get: function() {
                return this._.fft.windowName;
            }
        },
        spectrum: {
            get: function() {
                return this._.fft.spectrum;
            }
        }
    });
    
    $.process = function(tickID) {
        var _ = this._;
        var cell = this.cell;

        if (this.tickID !== tickID) {
            this.tickID = tickID;
            
            fn.inputSignalAR(this);
            
            _.fftCell.set(_.prevCell);
            _.fftCell.set(cell, cell.length);
            _.fft.forward(_.fftCell);
            _.prevCell.set(cell);
            
            var real = this.cellL;
            var imag = this.cellR;
            var _real = _.fft.real;
            var _imag = _.fft.imag;
            
            for (var i = cell.length; i--; ) {
                real[i] = _real[i];
                imag[i] = _imag[i];
            }
            
            this._.plotFlush = true;
        }
        return cell;
    };
    
    var super_plot = T.Object.prototype.plot;
    
    $.plot = function(opts) {
        if (this._.plotFlush) {
            var fft = this._.fft;

            var size     = 64;
            var spectrum = fft.spectrum;
            var step     = spectrum.length / size;
            var istep    = 1 / step;
            var data    = new Float32Array(size);
            var i, imax = spectrum.length;
            var j, jmax = step;

            var v, x, k = 0, peak = 0;
            for (i = 0; i < imax; i += step) {
                v = 0;
                for (j = 0; j < jmax; ++j) {
                    v += spectrum[i + j];
                }
                x = v * istep;
                data[k++] = x;
                if (peak < x) {
                    peak = x;
                }
            }
            for (i = data.length; i--; ) {
                data[i] /= peak;
            }
            
            this._.plotData  = data;
            this._.plotFlush = null;
        }
        return super_plot.call(this, opts);
    };
    
    fn.register("fft", FFTNode);
    
})(timbre);
