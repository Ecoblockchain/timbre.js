(function() {
    "use strict";
    
    var fn = timbre.fn;
    var timevalue  = timbre.timevalue;
    var Compressor = timbre.modules.Compressor;
    
    function CompressorNode(_args) {
        timbre.Object.call(this, _args);
        fn.fixAR(this);
        
        var _ = this._;
        _.thresh = timbre(-24);
        _.knee   = timbre(30);
        _.ratio  = timbre(12);
        _.postGain  =   6;
        _.attack    =   3;
        _.release   = 250;
        _.reduction =   0;
        
        _.comp = new Compressor(timbre.samplerate);
        _.comp.dbPostGain  = _.postGain;
        _.comp.attackTime  = _.attack  * 0.001;
        _.comp.releaseTime = _.release * 0.001;
    }
    fn.extend(CompressorNode);
    
    var $ = CompressorNode.prototype;
    
    Object.defineProperties($, {
        thresh: {
            set: function(value) {
                this._.thresh = timbre(value);
            },
            get: function() {
                return this._.thresh;
            }
        },
        knee: {
            set: function(value) {
                this._.kne = timbre(value);
            },
            get: function() {
                return this._.knee;
            }
        },
        ratio: {
            set: function(value) {
                this._.ratio = timbre(value);
            },
            get: function() {
                return this._.ratio;
            }
        },
        postGain: {
            set: function(value) {
                if (typeof value === "number") {
                    this._.postGain = value;
                    this._.comp.dbPostGain = value;
                }
            },
            get: function() {
                return this._.postGain;
            }
        },
        attack: {
            set: function(value) {
                if (typeof value === "string") {
                    value = timevalue(value);
                }
                if (typeof value === "number") {
                    value = (value < 0) ? 0 : (1000 < value) ? 1000 : value;
                    this._.attack = value;
                    this._.comp.attackTime = value * 0.001;
                }
            },
            get: function() {
                return this._.attack;
            }
        },
        release: {
            set: function(value) {
                if (typeof value === "string") {
                    value = timevalue(value);
                    if (value <= 0) {
                        value = 0;
                    }
                }
                if (typeof value === "number") {
                    value = (value < 0) ? 0 : (1000 < value) ? 1000 : value;
                    this._.release = value;
                    this._.comp.releaseTime = value * 0.001;
                }
            },
            get: function() {
                return this._.release;
            }
        },
        reduction: {
            get: function() {
                return this._.reduction;
            }
        }
    });
    
    $.process = function(tickID) {
        var _ = this._;
        var cell = this.cell;
        
        if (this.tickID !== tickID) {
            this.tickID = tickID;
            
            fn.inputSignalAR(this);
            
            var thresh = _.thresh.process(tickID)[0];
            var knee   = _.knee.process(tickID)[0];
            var ratio  = _.ratio.process(tickID)[0];
            
            _.comp.process(cell, cell, thresh, knee, ratio);
            
            _.reduction = _.comp.meteringGain;
            
            fn.outputSignalAR(this);
        }
        
        return cell;
    };
    
    fn.register("comp", CompressorNode);
    fn.alias("compressor", "comp");
    
})();
