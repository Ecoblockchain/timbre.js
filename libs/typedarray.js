(function(window) {
    if (window.Float32Array) return;

    var unsigned = 0;
    var signed   = 1;
    var floated  = 2;
    
    function TypedArray(klass, arg, offset, length) {
        var a, b, bits, i, imax;
        if (Array.isArray(arg)) {
            if (arg.__view) {
                if (typeof offset === "undefined") {
                    offset = 0;
                }
                if (typeof length === "undefined") {
                    length = arg.length - offset;
                }
                bits = klass.bits;
                b = arg.slice(offset, offset + length);
                a = new Array(b.length / bits);
                for (i = 0, imax = a.length; i < imax; ++i) {
                    a[i] = 0;
                }
                for (i = 0, imax = b.length; i < imax; ++i) {
                    a[(i/bits)|0] += (b[i] & 0xFF) << ((i % bits) * 8);
                }
            } else {
                a = arg.slice();
            }
        } else if (typeof arg === "number" && arg > 0) {
            a = new Array(arg|0);
        } else {
            a = [];
        }
        if (klass.type !== floated) {
            for (i = 0, imax = a.length; i < imax; ++i) {
                this[i] = (+a[i] || 0) & ((1 << (2 * 8)) - 1);
            }
        } else {
            for (i = 0, imax = a.length; i < imax; ++i) {
                this[i] = a[i] || 0;
            }
        }
        if (klass.type === signed) {
            for (i = 0, imax = a.length; i < imax; ++i) {
                if (a[i] & (1 << ((bits * 8) - 1))) {
                    this[i] -= 1 << (bits * 8);
                }
            }
        }
        this.length   = a.length;
        this.__klass  = klass;
        this.set      = set;
        this.subarray = subarray;
        this.byteLength = klass.bits * a.length;
        this.byteOffset = offset || 0;
        Object.defineProperty(this, "buffer", {
            get: function() {
                return new ArrayBuffer(this);
            }
        })
    }
    
    function ArrayBuffer(_) {
        var a = new Array(_.byteLength);
        var bits = _.__klass.bits, shift;
        for (var i = 0, imax = a.length; i < imax; ++i) {
            shift = (i % bits) * 8;
            a[i] = (_[(i / bits)|0] & (0x0FF << shift)) >>> shift;
        }
        a.__view = _;
        return a;
    }
    
    var set = function(array, offset) {
        if (typeof offset === "undefined") {
            offset = 0;
        }
        var i, imax = Math.min(this.length, array.length - offset);
        for (i = 0; i < imax; ++i) {
            this[i] = array[i + offset];
        }
    };
    
    var subarray = function(begin, end) {
        if (typeof end === "undefined") {
            end = this.length;
        }
        var i, imax = end - begin;
        var a = new Array(imax);
        for (i = 0; i < imax; ++i) {
            a[i] = this[i + begin];
        }
        return new this.__klass(a);
    };
    
    function Int8Array(arg, offset, length) {
        TypedArray.call(this, Int8Array, arg, offset, length);
    }
    Int8Array.bits = 1; Int8Array.type = signed;
    
    function Uint8Array(arg, offset, length) {
        TypedArray.call(this, Uint8Array, arg, offset, length);
    };
    Uint8Array.bits = 1; Uint8Array.type = unsigned;
    
    function Int16Array(arg, offset, length) {
        TypedArray.call(this, Int16Array, arg, offset, length);
    };
    Int16Array.bits = 2; Int16Array.type = signed;
    
    function Uint16Array(arg, offset, length) {
        TypedArray.call(this, Uint16Array, arg, offset, length);
    };
    Uint16Array.bits = 2; Uint16Array.type = unsigned;
    
    function Int32Array(arg, offset, length) {
        TypedArray.call(this, Int32Array, arg, offset, length);
    };
    Int32Array.bits = 4; Int32Array.type = signed;
    
    function Uint32Array(arg, offset, length) {
        TypedArray.call(this, Uint32Array, arg, offset, length);
    };
    Uint32Array.bits = 4; Uint32Array.type = unsigned;
    
    function Float32Array(arg, offset, length) {
        TypedArray.call(this, Float32Array, arg, offset, length);
    };
    Float32Array.bits = 4; Float32Array.type = floated;
    
    function Float64Array(arg, offset, length) {
        TypedArray.call(this, Float64Array, arg, offset, length);
    };
    Float64Array.bits = 8; Float64Array.type = floated;
    
    window.Int8Array    = Int8Array;
    window.Uint8Array   = Uint8Array;
    window.Int16Array   = Int16Array;
    window.Uint16Array  = Uint16Array;
    window.Int32Array   = Int32Array;
    window.Uint32Array  = Uint32Array;
    window.Float32Array = Float32Array;
    window.Float64Array = Float64Array;
    
})(window);
