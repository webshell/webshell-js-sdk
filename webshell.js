var wsh;

(function ($) {
    if (window.XDomainRequest) {
        $.ajaxTransport(function (s) {
            if (s.crossDomain && s.async) {
                if (s.timeout) {
                    s.xdrTimeout = s.timeout;
                    delete s.timeout;
                }
                var xdr;
                return {
                    send: function (_, complete) {
                        function callback(status, statusText, responses, responseHeaders) {
                            xdr.onload = xdr.onerror = xdr.ontimeout = $.noop;
                            xdr = undefined;
                            complete( status, statusText, responses, responseHeaders );
                        }
                        xdr = new XDomainRequest();
                        xdr.open(s.type, s.url);
                        xdr.onload = function () {
                            callback(200, "OK", { text: xdr.responseText }, "Content-Type: " + xdr.contentType );
                        };
                        xdr.onerror = function () {
                            callback(404, "Not Found");
                        };
                        if ( s.xdrTimeout ) {
                            xdr.ontimeout = function () {
                                callback(0, "timeout");
                            };
                            xdr.timeout = s.xdrTimeout;
                        }
                        xdr.send((s.hasContent && s.data) || null );
                    },
                    abort: function() {
                        if (xdr) {
                            xdr.onerror = jQuery.noop();
                            xdr.abort();
                        }
                    }
                };
            }
        });
    }

    function jsApi(obj, pid, opts) {
        var self = this;

        this.obj = obj;
        this.pid = pid;
        this.wsh = {
            exec: function(x) {
                if (typeof x == 'string')
                    x = {code:x};
                if (typeof x.code == 'string')
                {
                    x.code = '(' + x.code + ')();'
                    x.closure = false;
                }
                optscpy = {};
                for (var i in opts)
                    if (x[i])
                        optscpy[i] = x[i];
                    else
                        optscpy[i] = opts[i];
                wsh.exec(optscpy);
            }
        }

        this._cvfunctions(this.obj);
        if (this.obj.interface)
            this._cvfunctions(this.obj.interface);

        this.jsinterface = {};
        for (var k in this.obj.interface)
            if (typeof this.obj.interface[k] == 'function')
                this.jsinterface[k] = (function(k) { return function() {
                    self.run({
                        js_call: k,
                        js_args: arguments,
                        raw: true
                    });
                } })(k);
            else
                this.jsinterface[k] = this.obj.interface[k]

        window['jsClientApi_' + pid] = eval('function jsClientApi_' + pid + '() { wsh.procs["' + obj.name + '"].loaded.loaded() }; jsClientApi_' + pid);
    }

    jsApi.prototype._cvfunctions = function(obj) {
        if (typeof obj != 'object')
            return;
        for (var i in obj)
            if (typeof obj[i] == 'string' && obj[i].substr(0, 8) == 'function')
                obj[i] = eval('(' + obj[i].replace(/\\"/g, '"').replace(/\\n/g, "\n").replace(/\\t/g, "\t") + ')')
    }

    jsApi.prototype.initialize = function() {
        if (wsh.procs[this.obj.name].initialized !== undefined) {
        }
        else {
            wsh.procs[this.obj.name].initialized = false;
            wsh.procs[this.obj.name].loaded = this;
            this.obj.initialize.apply(this.obj, [window['jsClientApi_' + this.pid], 'jsClientApi_' + this.pid]);
        }
    }

    jsApi.prototype.loaded = function() {
        wsh.procs[this.obj.name].initialized = true;
        this.obj.loaded.apply(this.obj);
        for (var i in wsh.procs[this.obj.name].create)
            wsh.procs[this.obj.name].instance[
                wsh.procs[this.obj.name].create[i]
            ].create();
        delete wsh.procs[this.obj.name].create;
    }

    jsApi.prototype.ready = function(arg) {
        if (typeof arg == "function")
            throw Error('not implemented yet');
        this.created = true;
        for (var i in this.calls)
            this.run(this.calls[i])
        this.calls = [];
    }

    jsApi.prototype.create = function(arg) {
        if ( ! wsh.procs[this.obj.name])
            wsh.procs[this.obj.name] = {};
        if ( ! wsh.procs[this.obj.name].instance)
            wsh.procs[this.obj.name].instance = {};
        wsh.procs[this.obj.name].instance[this.pid] = this;
        if ( ! wsh.procs[this.obj.name].initialized) {
            if ( ! wsh.procs[this.obj.name].create)
                wsh.procs[this.obj.name].create = [];
            wsh.procs[this.obj.name].create[wsh.procs[this.obj.name].create.length] = this.pid;
            this.initialize(this.pid);
        }
        else {
            var ret = this.obj.create.apply(this.obj, [this]);
            if (ret !== false)
                this.ready();
        }
    }

    jsApi.prototype.run = function(meta) {
        if ( ! this.created) {
            this.calls = this.calls || [];
            this.calls[this.calls.length] = meta;
        }
        else {
            if ( ! meta.raw)
                meta.js_args = JSON.parse(meta.js_args, function(k,v) {
                    if (v && typeof v == 'string' && v.substr(0,8) == 'function')
                        return eval('(' + v + ')');
                    return v;
                });
            for (var i in meta.js_args)
                if (typeof meta.js_args[i] == 'function')
                    meta.js_args[i].wsh = this.wsh;
            this.obj.interface[meta.js_call].apply(this.obj, meta.js_args);
        }
    }


    function wsClass() {
        this.wspubkey = '';
        this.gpid = 0;
        this.procs = [];
    }

    wsClass.prototype.initialize = function(apikey) {
        this.wspubkey = apikey;
    }

    wsClass.prototype.display = function(json, res) {
        if (json.view)
            res.html(json.view);
    }

    wsClass.prototype.getLocation = function(opts) {
        var self = this;
        if (navigator.geolocation)
        {
            navigator.geolocation.getCurrentPosition(function(position) {
                opts.here = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                return self.exec(opts);
            });
            return true;
        }
        else
            return false;
    }

    /*
     * Options can contain:
     *  code: required, the code to execute, can be string or function // todo function
     *  process: callback(data, meta) executed for each received view
     *  success: callback(data) executed when the request finishes
     *  complete: callback executed at very end, when scripts are loaded
     *  format: format of the response. can be 'json'
     */
    wsClass.prototype.exec = function(opts) {
        var self = this;

        if (typeof opts != 'object')
            throw new Error("wsh.exec expects options");

        var cpy = {}
        for (var i in opts)
            cpy[i] = opts[i]
        opts = cpy

        var wshdata = {
            format: opts.format || 'json',
            key: self.wspubkey,
        };

        if (opts.code)
        {
            if (typeof opts.code == 'string' && opts.code.match(/^\#\![ \t]+[a-zA-Z_]+[ \t]*[\r\n]/))
                wshdata.code = opts.code
            else
            {
                if (typeof opts.code == 'string')
                    wshdata.code = opts.closure ? '(function() {' + opts.code.trim() + "\n})();" : opts.code.trim();
                else if (typeof opts.code == 'function')
                    wshdata.code = '(' + opts.code.toString().trim() + ')();';
            }

            opts.here = opts.here || wshdata.code.indexOf('here()') >= 0
        }
        else {
            wshdata.hash = opts.hash
            wshdata.version = opts.version || 0
        }

        if (typeof opts.here == 'object' && opts.here.lat !== undefined && opts.here.lng !== undefined)
        {
            wshdata.lat = opts.here.lat
            wshdata.lng = opts.here.lng
        }
        else if (opts.here === true)
            return this.getLocation(opts)

        var process;
        if (typeof opts.process == 'string' && $(process).length > 0)
            process = function(data, meta) { self.display(meta, $(process)); }
        else
            process = opts.process;

        var success = opts.success;
        var complete = opts.complete;

        var sid = wsh.readCookie('sid');
        if (sid != null)
            wshdata['csid'] = sid;

        if (opts.args)
            wshdata['args'] = JSON.stringify(opts.args);

        var url = window.location.toString();
        var urlparts = url.split('/');
        wshdata['domain'] = urlparts[2];

        $.ajax({
            type: "GET",
            url: "http://api.webshell.io",
            timeout: opts.timeout || 150000,
            crossDomain: true,
            async: opts.async,
            data: wshdata,
            error: function(xhr, status) {
                if (status == 'timeout')
                    json = {_meta: {view: "Error : Timeout"}};
                else if (status == 'error')
                    json = {_meta: {view: "Error : Unknown"}};
                else if (status == 'abort')
                    json = {_meta: {view: "Error : Abort"}};
                json.data = {error:true};
                json._meta.pid = ++self.gpid;

                if (process) process(json.data, json._meta);
                if (success) success(json);
                if (complete) complete(json);
            },
            success: function(msg){
                try {
                    var json = msg ? JSON.parse(msg) : undefined;
                } catch (e) {
                    json = {_meta: {view: "Error : Malformed response"}};
                }

                var datas = [];
                function runProcess(json) {
                    if (json && typeof json == 'object' && json._meta) {
                        processed = false;
                        if (json._meta.cookie_del)
                            for (var k in json._meta.cookie_del)
                                wsh.eraseCookie(json._meta.cookie_del[k]);
                        else if (json._meta.cookie_add)
                            for (var k in json._meta.cookie_add)
                                wsh.createCookie(k, json._meta.cookie_add[k], 10);
                        else if (json._meta.js_pid) {
                            if (json._meta.js_call) {
                                self.procs[json._meta.js_name].instance[json._meta.js_pid].run(json._meta);
                            }
                            else {
                                processed = true;
                                json.data = eval('(' + json.data + ')');
                                json._meta.pid = json._meta.js_pid;
                                json.data = new jsApi(json.data, json._meta.pid, opts);
                                if (process)
                                    process(json.data.jsinterface, json._meta);
                                json.data.create();
                                datas[datas.length] = json.data;
                            }
                        }
                        else {
                            processed = true;
                            json._meta.pid = ++self.gpid;
                            if (process)
                                process(json.data, json._meta);
                            datas[datas.length] = json.data;
                        }
                        return processed;
                    }
                    else if (json) {
                        if (process)
                            process(json, {pid: ++self.gpid});
                        datas[datas.length] = json;
                    }
                    return true;
                }
                if (Array.isArray(json)) {
                    success_data = json.shift();
                    for (var k in json)
                        if ( ! runProcess(json[k]))
                            delete json[k];
                }
                else
                    success_data = json;
                if (datas.length == 0)
                    datas = undefined;
                else if (datas.length == 1)
                    datas = datas[0];
                if (success) success(success_data);
                if (complete) complete(datas);
            }
        });
        return true;
    }
    wsClass.prototype.createCookie = function(name,value,days) {
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 86400000));
            var expires = "; expires="+date.toGMTString();
        }
        else var expires = "";
        document.cookie = name+"="+value+expires+"; path=/";
    }

    wsClass.prototype.readCookie = function(name) {
        var nameEQ = name + "=";
        var ca = document.cookie.split(';');
        for(var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0)==' ') c = c.substring(1,c.length);
            if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
        }
        return null;
    }

    wsClass.prototype.eraseCookie = function(name) {
        wsh.createCookie(name,"",-1);
    }
    wsh = new wsClass();
})(jQuery);
