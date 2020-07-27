/* 2018-9-15 18:26:14 | 版权所有 火星科技 http://marsgis.cn  【联系我们QQ：516584683，微信：marsgis】 */
function GifImageProperty(e) {
    var self = this;
    this._url = null,
    this._lastFrameTime = null,
    this._frames = null;
    this._gifCanvas = document.createElement("canvas"),
    this._gifCanvas.width = 1,
    this._gifCanvas.height = 1,
    this._gifCtx = null,
    this._frameIndex = -1,
    this._lastIndex = -1,
    this._gif = null,
    this._src = e.url,
    this.image = new Image(),
    this.image.src = e.url,
    this._image = new Image(),
    this._image.src = e.url,
    this._setInterval = setInterval(function(){
        self.setSrc();
    },20)
    e.url && (this.url = e.url)
}
!function s(n, o, l) {
    function u(t, e) {
        if (!o[t]) {
            if (!n[t]) {
                var r = "function" == typeof require && require;
                if (!e && r)
                    return r(t, !0);
                if (p)
                    return p(t, !0);
                var a = new Error("Cannot find module '" + t + "'");
                throw a.code = "MODULE_NOT_FOUND",
                a
            }
            var i = o[t] = {
                exports: {}
            };
            n[t][0].call(i.exports, function(e) {
                var r = n[t][1][e];
                return u(r || e)
            }, i, i.exports, s, n, o, l)
        }
        return o[t].exports
    }
    for (var p = "function" == typeof require && require, e = 0; e < l.length; e++)
        u(l[e]);
    return u
}({
    1: [function(e, r, t) {
        function a(e) {
            this.data = e,
            this.pos = 0
        }
        a.prototype.readByte = function() {
            return this.data[this.pos++]
        }
        ,
        a.prototype.peekByte = function() {
            return this.data[this.pos]
        }
        ,
        a.prototype.readBytes = function(e) {
            for (var r = new Array(e), t = 0; t < e; t++)
                r[t] = this.readByte();
            return r
        }
        ,
        a.prototype.peekBytes = function(e) {
            for (var r = new Array(e), t = 0; t < e; t++)
                r[t] = this.data[this.pos + t];
            return r
        }
        ,
        a.prototype.readString = function(e) {
            for (var r = "", t = 0; t < e; t++)
                r += String.fromCharCode(this.readByte());
            return r
        }
        ,
        a.prototype.readBitArray = function() {
            for (var e = [], r = this.readByte(), t = 7; 0 <= t; t--)
                e.push(!!(r & 1 << t));
            return e
        }
        ,
        a.prototype.readUnsigned = function(e) {
            var r = this.readBytes(2);
            return e ? (r[1] << 8) + r[0] : (r[0] << 8) + r[1]
        }
        ,
        r.exports = a
    }
    , {}],
    2: [function(e, r, t) {
        var a = e("./bytestream");
        function i(e) {
            this.stream = new a(e),
            this.output = {}
        }
        i.prototype.parse = function(e) {
            return this.parseParts(this.output, e),
            this.output
        }
        ,
        i.prototype.parseParts = function(e, r) {
            for (var t = 0; t < r.length; t++) {
                var a = r[t];
                this.parsePart(e, a)
            }
        }
        ,
        i.prototype.parsePart = function(e, r) {
            var t, a = r.label;
            if (!r.requires || r.requires(this.stream, this.output, e))
                if (r.loop) {
                    for (var i = []; r.loop(this.stream); ) {
                        var s = {};
                        this.parseParts(s, r.parts),
                        i.push(s)
                    }
                    e[a] = i
                } else
                    r.parts ? (t = {},
                    this.parseParts(t, r.parts),
                    e[a] = t) : r.parser ? (t = r.parser(this.stream, this.output, e),
                    r.skip || (e[a] = t)) : r.bits && (e[a] = this.parseBits(r.bits))
        }
        ,
        i.prototype.parseBits = function(e) {
            var r = {}
              , t = this.stream.readBitArray();
            for (var a in e) {
                var i = e[a];
                i.length ? r[a] = t.slice(i.index, i.index + i.length).reduce(function(e, r) {
                    return 2 * e + r
                }, 0) : r[a] = t[i.index]
            }
            return r
        }
        ,
        r.exports = i
    }
    , {
        "./bytestream": 1
    }],
    3: [function(e, r, t) {
        var a = {
            readByte: function() {
                return function(e) {
                    return e.readByte()
                }
            },
            readBytes: function(r) {
                return function(e) {
                    return e.readBytes(r)
                }
            },
            readString: function(r) {
                return function(e) {
                    return e.readString(r)
                }
            },
            readUnsigned: function(r) {
                return function(e) {
                    return e.readUnsigned(r)
                }
            },
            readArray: function(n, o) {
                return function(e, r, t) {
                    for (var a = o(e, r, t), i = new Array(a), s = 0; s < a; s++)
                        i[s] = e.readBytes(n);
                    return i
                }
            }
        };
        r.exports = a
    }
    , {}],
    4: [function(e, r, t) {
        var a = e("./gif");
        "undefined" != typeof window && (window.gifuct = a),
        "undefined" != typeof define && define.amd && define(function() {
            return a
        })
    }
    , {
        "./gif": 5
    }],
    5: [function(e, r, t) {
        var i = e("../bower_components/js-binary-schema-parser/src/dataparser")
          , s = e("./schema");
        function a(e) {
            var r = new Uint8Array(e)
              , t = new i(r);
            this.raw = t.parse(s),
            this.raw.hasImages = !1;
            for (var a = 0; a < this.raw.frames.length; a++)
                if (this.raw.frames[a].image) {
                    this.raw.hasImages = !0;
                    break
                }
        }
        a.prototype.decompressFrame = function(e, r) {
            if (e >= this.raw.frames.length)
                return null;
            var t = this.raw.frames[e];
            if (t.image) {
                var a = t.image.descriptor.width * t.image.descriptor.height
                  , i = function(e, r, t) {
                    var a, i, s, n, o, l, u, p, d, f, c, h, m, g, y, v, _ = 4096, b = t, x = new Array(t), w = new Array(_), C = new Array(_), B = new Array(4097);
                    for (o = 1 + (i = 1 << (h = e)),
                    a = i + 2,
                    u = -1,
                    s = (1 << (n = h + 1)) - 1,
                    d = 0; d < i; d++)
                        w[d] = 0,
                        C[d] = d;
                    for (c = p = count = m = g = v = y = 0,
                    f = 0; f < b; ) {
                        if (0 === g) {
                            if (p < n) {
                                c += r[y] << p,
                                p += 8,
                                y++;
                                continue
                            }
                            if (d = c & s,
                            c >>= n,
                            p -= n,
                            a < d || d == o)
                                break;
                            if (d == i) {
                                s = (1 << (n = h + 1)) - 1,
                                a = i + 2,
                                u = -1;
                                continue
                            }
                            if (-1 == u) {
                                B[g++] = C[d],
                                m = u = d;
                                continue
                            }
                            for ((l = d) == a && (B[g++] = m,
                            d = u); i < d; )
                                B[g++] = C[d],
                                d = w[d];
                            m = 255 & C[d],
                            B[g++] = m,
                            a < _ && (w[a] = u,
                            C[a] = m,
                            0 == (++a & s) && a < _ && (n++,
                            s += a)),
                            u = l
                        }
                        g--,
                        x[v++] = B[g],
                        f++
                    }
                    for (f = v; f < b; f++)
                        x[f] = 0;
                    return x
                }(t.image.data.minCodeSize, t.image.data.blocks, a);
                t.image.descriptor.lct.interlaced && (i = function(e, r) {
                    for (var t = new Array(e.length), a = e.length / r, i = [0, 4, 2, 1], s = [8, 8, 4, 2], n = 0, o = 0; o < 4; o++)
                        for (var l = i[o]; l < a; l += s[o])
                            u = l,
                            p = n,
                            void 0,
                            d = e.slice(p * r, (p + 1) * r),
                            t.splice.apply(t, [u * r, r].concat(d)),
                            n++;
                    var u, p, d;
                    return t
                }(i, t.image.descriptor.width));
                var s = {
                    pixels: i,
                    dims: {
                        top: t.image.descriptor.top,
                        left: t.image.descriptor.left,
                        width: t.image.descriptor.width,
                        height: t.image.descriptor.height
                    }
                };
                return t.image.descriptor.lct && t.image.descriptor.lct.exists ? s.colorTable = t.image.lct : s.colorTable = this.raw.gct,
                t.gce && (s.delay = 10 * (t.gce.delay || 10),
                s.disposalType = t.gce.extras.disposal,
                t.gce.extras.transparentColorGiven && (s.transparentIndex = t.gce.transparentColorIndex)),
                r && (s.patch = function(e) {
                    for (var r = e.pixels.length, t = new Uint8ClampedArray(4 * r), a = 0; a < r; a++) {
                        var i = 4 * a
                          , s = e.pixels[a]
                          , n = e.colorTable[s];
                        t[i] = n[0],
                        t[i + 1] = n[1],
                        t[i + 2] = n[2],
                        t[i + 3] = s !== e.transparentIndex ? 255 : 0
                    }
                    return t
                }(s)),
                s
            }
            return null
        }
        ,
        a.prototype.decompressFrames = function(e) {
            for (var r = [], t = 0; t < this.raw.frames.length; t++) {
                this.raw.frames[t].image && r.push(this.decompressFrame(t, e))
            }
            return r
        }
        ,
        r.exports = a
    }
    , {
        "../bower_components/js-binary-schema-parser/src/dataparser": 2,
        "./schema": 6
    }],
    6: [function(e, r, t) {
        var a = e("../bower_components/js-binary-schema-parser/src/parsers")
          , i = {
            label: "blocks",
            parser: function(e) {
                for (var r = [], t = e.readByte(); 0 !== t; t = e.readByte())
                    r = r.concat(e.readBytes(t));
                return r
            }
        }
          , s = {
            label: "gce",
            requires: function(e) {
                var r = e.peekBytes(2);
                return 33 === r[0] && 249 === r[1]
            },
            parts: [{
                label: "codes",
                parser: a.readBytes(2),
                skip: !0
            }, {
                label: "byteSize",
                parser: a.readByte()
            }, {
                label: "extras",
                bits: {
                    future: {
                        index: 0,
                        length: 3
                    },
                    disposal: {
                        index: 3,
                        length: 3
                    },
                    userInput: {
                        index: 6
                    },
                    transparentColorGiven: {
                        index: 7
                    }
                }
            }, {
                label: "delay",
                parser: a.readUnsigned(!0)
            }, {
                label: "transparentColorIndex",
                parser: a.readByte()
            }, {
                label: "terminator",
                parser: a.readByte(),
                skip: !0
            }]
        }
          , n = {
            label: "image",
            requires: function(e) {
                return 44 === e.peekByte()
            },
            parts: [{
                label: "code",
                parser: a.readByte(),
                skip: !0
            }, {
                label: "descriptor",
                parts: [{
                    label: "left",
                    parser: a.readUnsigned(!0)
                }, {
                    label: "top",
                    parser: a.readUnsigned(!0)
                }, {
                    label: "width",
                    parser: a.readUnsigned(!0)
                }, {
                    label: "height",
                    parser: a.readUnsigned(!0)
                }, {
                    label: "lct",
                    bits: {
                        exists: {
                            index: 0
                        },
                        interlaced: {
                            index: 1
                        },
                        sort: {
                            index: 2
                        },
                        future: {
                            index: 3,
                            length: 2
                        },
                        size: {
                            index: 5,
                            length: 3
                        }
                    }
                }]
            }, {
                label: "lct",
                requires: function(e, r, t) {
                    return t.descriptor.lct.exists
                },
                parser: a.readArray(3, function(e, r, t) {
                    return Math.pow(2, t.descriptor.lct.size + 1)
                })
            }, {
                label: "data",
                parts: [{
                    label: "minCodeSize",
                    parser: a.readByte()
                }, i]
            }]
        }
          , o = {
            label: "text",
            requires: function(e) {
                var r = e.peekBytes(2);
                return 33 === r[0] && 1 === r[1]
            },
            parts: [{
                label: "codes",
                parser: a.readBytes(2),
                skip: !0
            }, {
                label: "blockSize",
                parser: a.readByte()
            }, {
                label: "preData",
                parser: function(e, r, t) {
                    return e.readBytes(t.text.blockSize)
                }
            }, i]
        }
          , l = {
            label: "frames",
            parts: [s, {
                label: "application",
                requires: function(e, r, t) {
                    var a = e.peekBytes(2);
                    return 33 === a[0] && 255 === a[1]
                },
                parts: [{
                    label: "codes",
                    parser: a.readBytes(2),
                    skip: !0
                }, {
                    label: "blockSize",
                    parser: a.readByte()
                }, {
                    label: "id",
                    parser: function(e, r, t) {
                        return e.readString(t.blockSize)
                    }
                }, i]
            }, {
                label: "comment",
                requires: function(e, r, t) {
                    var a = e.peekBytes(2);
                    return 33 === a[0] && 254 === a[1]
                },
                parts: [{
                    label: "codes",
                    parser: a.readBytes(2),
                    skip: !0
                }, i]
            }, n, o],
            loop: function(e) {
                var r = e.peekByte();
                return 33 === r || 44 === r
            }
        }
          , u = [{
            label: "header",
            parts: [{
                label: "signature",
                parser: a.readString(3)
            }, {
                label: "version",
                parser: a.readString(3)
            }]
        }, {
            label: "lsd",
            parts: [{
                label: "width",
                parser: a.readUnsigned(!0)
            }, {
                label: "height",
                parser: a.readUnsigned(!0)
            }, {
                label: "gct",
                bits: {
                    exists: {
                        index: 0
                    },
                    resolution: {
                        index: 1,
                        length: 3
                    },
                    sort: {
                        index: 4
                    },
                    size: {
                        index: 5,
                        length: 3
                    }
                }
            }, {
                label: "backgroundColorIndex",
                parser: a.readByte()
            }, {
                label: "pixelAspectRatio",
                parser: a.readByte()
            }]
        }, {
            label: "gct",
            requires: function(e, r) {
                return r.lsd.gct.exists
            },
            parser: a.readArray(3, function(e, r) {
                return Math.pow(2, r.lsd.gct.size + 1)
            })
        }, l];
        r.exports = u
    }
    , {
        "../bower_components/js-binary-schema-parser/src/parsers": 3
    }]
}, {}, [4]),
Object.defineProperties(GifImageProperty.prototype, {
    url: {
        get: function() {
            return this._url
        },
        set: function(e) {
            if (this._url = e,
            this._url) {
                var r = this;
                Cesium.Resource.fetchArrayBuffer({
                    url: this._url
                }).then(function(e) {
                    r._gif = new gifuct(e),
                    r._frames = r._gif.decompressFrames(!0),
                    r._frameIndex = -1,
                    r._lastFrameTime = null,
                    r._gifCanvas || (r._gifCanvas = document.createElement("canvas")),
                    r._gifCanvas.width = r._frames[0].dims.width,
                    r._gifCanvas.height = r._frames[0].dims.height,
                    r._gifCtx = r._gifCanvas.getContext("2d"),
                    r._gifCtx.clearRect(0, 0, r._gifCanvas.width, r._gifCanvas.height);

                    for(var i=0;i<r._frames.length;i++)
                    {
                        r._frames[i]['data'] = new Uint8ClampedArray(r._frames[0].patch.length);
                        for(var a=0;a<r._frames[0].patch.length;a++)
                        {
                            r._frames[i]['data'][a] = r._frames[0].patch[a];
                        }
                        var dims = r._frames[i].dims;
                        for(var j=dims.top;j<dims.height+dims.top;j++)
                        {
                            for(var z=dims.left;z<dims.width+dims.left;z++)
                            {
                            //     
                            //     , n = e.colorTable[s];
                            //   t[i] = n[0],
                            //   t[i + 1] = n[1],
                            //   t[i + 2] = n[2],
                            //   t[i + 3] = s !== e.transparentIndex ? 255 : 0



                                var n = j*r._frames[0].dims.width+z;
                                var m = (j-dims.top)*dims.width+z-dims.left;
                                var s = r._frames[i].pixels[m];
                                // if(r._frames[0].dims.width ==dims.width && r._frames[0].dims.height ==dims.height)
                                // {
                                //     r._frames[i]['data'][n*4] = r._frames[i]['patch'][m*4];
                                //     r._frames[i]['data'][n*4+1] = r._frames[i]['patch'][m*4+1];
                                //     r._frames[i]['data'][n*4+2] = r._frames[i]['patch'][m*4+2];
                                    
                                //     r._frames[i]['data'][n*4+3] = 255;//r._frames[i]['patch'][m*4+3];
                                // }
                                // else 
                                if(s !==r._frames[i].transparentIndex)
                                {
                                    r._frames[i]['data'][n*4] = r._frames[i]['patch'][m*4];
                                    r._frames[i]['data'][n*4+1] = r._frames[i]['patch'][m*4+1];
                                    r._frames[i]['data'][n*4+2] = r._frames[i]['patch'][m*4+2];
                                    r._frames[i]['data'][n*4+3] = r._frames[i]['patch'][m*4+3];
                                }
                                // else
                                // {
                                //     r._frames[i]['data'][n*4+3] = r._frames[i]['patch'][m*4+3]
                                // }
                            }
                        }
                        
                    }
                })
            } else
                this._frames = null,
                this._gif = null
        }
    }
}),
GifImageProperty.prototype.destroy = function() {
    this._frames = null,
    this._gif = null
}
,
GifImageProperty.prototype.renderFrame = function(e) {
    // if (e.canvas)
    //     this._gifCanvas = e.canvas;
    // else {
        //e.canvas = e.canvas||document.createElement("canvas");
        // var r = Cesium.defaultValue(e.dims.left, 0)
        //   , t = Cesium.defaultValue(e.dims.top, 0)
        //   , a = Cesium.defaultValue(e.dims.width, this._gifCanvas.width)
        //   , i = Cesium.defaultValue(e.dims.height, this._gifCanvas.height);
        // if (e.canvas.width = a,
        // e.canvas.height = i,
        // 0 == r && 0 == t && a == this._gifCanvas.width && i == this._gifCanvas.height) {
            var s = this._gifCtx.getImageData(0, 0, this._gifCanvas.width, this._gifCanvas.height);
            s.data.set(e.data),
            this._gifCtx.putImageData(s, 0, 0)
        // } else {
        //     var n;
        //     (n = this._tempCv ? this._tempCv : document.createElement("canvas")).width = a,
        //     n.height = i;
        //     var o = n.getContext("2d")
        //       , l = o.createImageData(a, i);
        //     l.data.set(e.patch),
        //     o.putImageData(l, 0, 0),
        //     this._gifCtx.drawImage(n, r, t, a, i)
        // }
        // var u = e.canvas.getContext("2d")
        //   , p = u.createImageData(a, i);
        // p.data.set(this._gifCtx.getImageData(r, t, a, i).data),
        // u.putImageData(p, r, t),
        //this._gifCanvas = e.canvas;
        this._src = this._gifCanvas.toDataURL();
    //}
}
,
GifImageProperty.prototype.getValue = function(e) {
    return this._image;
};

GifImageProperty.prototype.setSrc = function()
{
    if (!this._frames || !this._frames.length){}
    else
    {
        this._currentTime = new Date,
        this._lastFrameTime || (this._lastFrameTime = new Date);
        var r = this._currentTime - this._lastFrameTime;
        0 <= this._frameIndex ? this._frameIndex < this._frames.length ? this._frames[this._frameIndex].delay <= r && (this.renderFrame(this._frames[this._frameIndex]),
        this._lastFrameTime = this._currentTime,
        this._frameIndex++) : this._frameIndex = 0 : (this._lastFrameTime = this._currentTime,
        this._frameIndex = 0),
        this._gifCanvas;

    }
   
    this.imageOp = this.imageOp||{};

    if(this._lastIndex !=this._frameIndex)
    {
        
        this.imageOp[this._lastIndex] = this.imageOp[this._lastIndex]||new Image();
        this.imageOp[this._lastIndex].src = this._src;
        this._image = this.imageOp[this._lastIndex];
        this._lastIndex = this._frameIndex;
    }
}
Cesium.GifImageProperty = GifImageProperty;
