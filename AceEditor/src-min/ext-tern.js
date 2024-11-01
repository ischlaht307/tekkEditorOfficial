define("ace/snippets", ["require", "exports", "module", "ace/lib/oop", "ace/lib/event_emitter", "ace/lib/lang", "ace/range", "ace/anchor", "ace/keyboard/hash_handler", "ace/tokenizer", "ace/lib/dom", "ace/editor"], function(e, t, n) {
    "use strict";
    var r = e("./lib/oop"),
        i = e("./lib/event_emitter").EventEmitter,
        s = e("./lib/lang"),
        o = e("./range").Range,
        u = e("./anchor").Anchor,
        a = e("./keyboard/hash_handler").HashHandler,
        f = e("./tokenizer").Tokenizer,
        l = o.comparePoints,
        c = function() {
            this.snippetMap = {}, this.snippetNameMap = {}
        };
    (function() {
        r.implement(this, i), this.getTokenizer = function() {
            function e(e, t, n) {
                return e = e.substr(1), /^\d+$/.test(e) && !n.inFormatString ? [{
                    tabstopId: parseInt(e, 10)
                }] : [{
                    text: e
                }]
            }

            function t(e) {
                return "(?:[^\\\\" + e + "]|\\\\.)"
            }
            return c.$tokenizer = new f({
                start: [{
                    regex: /:/,
                    onMatch: function(e, t, n) {
                        return n.length && n[0].expectIf ? (n[0].expectIf = !1, n[0].elseBranch = n[0], [n[0]]) : ":"
                    }
                }, {
                    regex: /\\./,
                    onMatch: function(e, t, n) {
                        var r = e[1];
                        return r == "}" && n.length ? e = r : "`$\\".indexOf(r) != -1 ? e = r : n.inFormatString && (r == "n" ? e = "\n" : r == "t" ? e = "\n" : "ulULE".indexOf(r) != -1 && (e = {
                            changeCase: r,
                            local: r > "a"
                        })), [e]
                    }
                }, {
                    regex: /}/,
                    onMatch: function(e, t, n) {
                        return [n.length ? n.shift() : e]
                    }
                }, {
                    regex: /\$(?:\d+|\w+)/,
                    onMatch: e
                }, {
                    regex: /\$\{[\dA-Z_a-z]+/,
                    onMatch: function(t, n, r) {
                        var i = e(t.substr(1), n, r);
                        return r.unshift(i[0]), i
                    },
                    next: "snippetVar"
                }, {
                    regex: /\n/,
                    token: "newline",
                    merge: !1
                }],
                snippetVar: [{
                    regex: "\\|" + t("\\|") + "*\\|",
                    onMatch: function(e, t, n) {
                        n[0].choices = e.slice(1, -1).split(",")
                    },
                    next: "start"
                }, {
                    regex: "/(" + t("/") + "+)/(?:(" + t("/") + "*)/)(\\w*):?",
                    onMatch: function(e, t, n) {
                        var r = n[0];
                        return r.fmtString = e, e = this.splitRegex.exec(e), r.guard = e[1], r.fmt = e[2], r.flag = e[3], ""
                    },
                    next: "start"
                }, {
                    regex: "`" + t("`") + "*`",
                    onMatch: function(e, t, n) {
                        return n[0].code = e.splice(1, -1), ""
                    },
                    next: "start"
                }, {
                    regex: "\\?",
                    onMatch: function(e, t, n) {
                        n[0] && (n[0].expectIf = !0)
                    },
                    next: "start"
                }, {
                    regex: "([^:}\\\\]|\\\\.)*:?",
                    token: "",
                    next: "start"
                }],
                formatString: [{
                    regex: "/(" + t("/") + "+)/",
                    token: "regex"
                }, {
                    regex: "",
                    onMatch: function(e, t, n) {
                        n.inFormatString = !0
                    },
                    next: "start"
                }]
            }), c.prototype.getTokenizer = function() {
                return c.$tokenizer
            }, c.$tokenizer
        }, this.tokenizeTmSnippet = function(e, t) {
            return this.getTokenizer().getLineTokens(e, t).tokens.map(function(e) {
                return e.value || e
            })
        }, this.$getDefaultValue = function(e, t) {
            if (/^[A-Z]\d+$/.test(t)) {
                var n = t.substr(1);
                return (this.variables[t[0] + "__"] || {})[n]
            }
            if (/^\d+$/.test(t)) return (this.variables.__ || {})[t];
            t = t.replace(/^TM_/, "");
            if (!e) return;
            var r = e.session;
            switch (t) {
                case "CURRENT_WORD":
                    var i = r.getWordRange();
                case "SELECTION":
                case "SELECTED_TEXT":
                    return r.getTextRange(i);
                case "CURRENT_LINE":
                    return r.getLine(e.getCursorPosition().row);
                case "PREV_LINE":
                    return r.getLine(e.getCursorPosition().row - 1);
                case "LINE_INDEX":
                    return e.getCursorPosition().column;
                case "LINE_NUMBER":
                    return e.getCursorPosition().row + 1;
                case "SOFT_TABS":
                    return r.getUseSoftTabs() ? "YES" : "NO";
                case "TAB_SIZE":
                    return r.getTabSize();
                case "FILENAME":
                case "FILEPATH":
                    return "";
                case "FULLNAME":
                    return "Ace"
            }
        }, this.variables = {}, this.getVariableValue = function(e, t) {
            return this.variables.hasOwnProperty(t) ? this.variables[t](e, t) || "" : this.$getDefaultValue(e, t) || ""
        }, this.tmStrFormat = function(e, t, n) {
            var r = t.flag || "",
                i = t.guard;
            i = new RegExp(i, r.replace(/[^gi]/, ""));
            var s = this.tokenizeTmSnippet(t.fmt, "formatString"),
                o = this,
                u = e.replace(i, function() {
                    o.variables.__ = arguments;
                    var e = o.resolveVariables(s, n),
                        t = "E";
                    for (var r = 0; r < e.length; r++) {
                        var i = e[r];
                        if (typeof i == "object") {
                            e[r] = "";
                            if (i.changeCase && i.local) {
                                var u = e[r + 1];
                                u && typeof u == "string" && (i.changeCase == "u" ? e[r] = u[0].toUpperCase() : e[r] = u[0].toLowerCase(), e[r + 1] = u.substr(1))
                            } else i.changeCase && (t = i.changeCase)
                        } else t == "U" ? e[r] = i.toUpperCase() : t == "L" && (e[r] = i.toLowerCase())
                    }
                    return e.join("")
                });
            return this.variables.__ = null, u
        }, this.resolveVariables = function(e, t) {
            function o(t) {
                var n = e.indexOf(t, r + 1);
                n != -1 && (r = n)
            }
            var n = [];
            for (var r = 0; r < e.length; r++) {
                var i = e[r];
                if (typeof i == "string") n.push(i);
                else {
                    if (typeof i != "object") continue;
                    if (i.skip) o(i);
                    else {
                        if (i.processed < r) continue;
                        if (i.text) {
                            var s = this.getVariableValue(t, i.text);
                            s && i.fmtString && (s = this.tmStrFormat(s, i)), i.processed = r, i.expectIf == null ? s && (n.push(s), o(i)) : s ? i.skip = i.elseBranch : o(i)
                        } else i.tabstopId != null ? n.push(i) : i.changeCase != null && n.push(i)
                    }
                }
            }
            return n
        }, this.insertSnippetForSelection = function(e, t) {
            function f(e) {
                var t = [];
                for (var n = 0; n < e.length; n++) {
                    var r = e[n];
                    if (typeof r == "object") {
                        if (a[r.tabstopId]) continue;
                        var i = e.lastIndexOf(r, n - 1);
                        r = t[i] || {
                            tabstopId: r.tabstopId
                        }
                    }
                    t[n] = r
                }
                return t
            }
            var n = e.getCursorPosition(),
                r = e.session.getLine(n.row),
                i = e.session.getTabString(),
                s = r.match(/^\s*/)[0];
            n.column < s.length && (s = s.slice(0, n.column));
            var o = this.tokenizeTmSnippet(t);
            o = this.resolveVariables(o, e), o = o.map(function(e) {
                return e == "\n" ? e + s : typeof e == "string" ? e.replace(/\t/g, i) : e
            });
            var u = [];
            o.forEach(function(e, t) {
                if (typeof e != "object") return;
                var n = e.tabstopId,
                    r = u[n];
                r || (r = u[n] = [], r.index = n, r.value = "");
                if (r.indexOf(e) !== -1) return;
                r.push(e);
                var i = o.indexOf(e, t + 1);
                if (i === -1) return;
                var s = o.slice(t + 1, i),
                    a = s.some(function(e) {
                        return typeof e == "object"
                    });
                a && !r.value ? r.value = s : s.length && (!r.value || typeof r.value != "string") && (r.value = s.join(""))
            }), u.forEach(function(e) {
                e.length = 0
            });
            var a = {};
            for (var l = 0; l < o.length; l++) {
                var c = o[l];
                if (typeof c != "object") continue;
                var p = c.tabstopId,
                    d = o.indexOf(c, l + 1);
                if (a[p]) {
                    a[p] === c && (a[p] = null);
                    continue
                }
                var v = u[p],
                    m = typeof v.value == "string" ? [v.value] : f(v.value);
                m.unshift(l + 1, Math.max(0, d - l)), m.push(c), a[p] = c, o.splice.apply(o, m), v.indexOf(c) === -1 && v.push(c)
            }
            var g = 0,
                y = 0,
                b = "";
            o.forEach(function(e) {
                typeof e == "string" ? (e[0] === "\n" ? (y = e.length - 1, g++) : y += e.length, b += e) : e.start ? e.end = {
                    row: g,
                    column: y
                } : e.start = {
                    row: g,
                    column: y
                }
            });
            var w = e.getSelectionRange(),
                E = e.session.replace(w, b),
                S = new h(e),
                x = e.inVirtualSelectionMode && e.selection.index;
            S.addTabstops(u, w.start, E, x)
        }, this.insertSnippet = function(e, t) {
            var n = this;
            if (e.inVirtualSelectionMode) return n.insertSnippetForSelection(e, t);
            e.forEachSelection(function() {
                n.insertSnippetForSelection(e, t)
            }, null, {
                keepOrder: !0
            }), e.tabstopManager && e.tabstopManager.tabNext()
        }, this.$getScope = function(e) {
            var t = e.session.$mode.$id || "";
            t = t.split("/").pop();
            if (t === "html" || t === "php") {
                t === "php" && !e.session.$mode.inlinePhp && (t = "html");
                var n = e.getCursorPosition(),
                    r = e.session.getState(n.row);
                typeof r == "object" && (r = r[0]), r.substring && (r.substring(0, 3) == "js-" ? t = "javascript" : r.substring(0, 4) == "css-" ? t = "css" : r.substring(0, 4) == "php-" && (t = "php"))
            }
            return t
        }, this.getActiveScopes = function(e) {
            var t = this.$getScope(e),
                n = [t],
                r = this.snippetMap;
            return r[t] && r[t].includeScopes && n.push.apply(n, r[t].includeScopes), n.push("_"), n
        }, this.expandWithTab = function(e, t) {
            var n = this,
                r = e.forEachSelection(function() {
                    return n.expandSnippetForSelection(e, t)
                }, null, {
                    keepOrder: !0
                });
            return r && e.tabstopManager && e.tabstopManager.tabNext(), r
        }, this.expandSnippetForSelection = function(e, t) {
            var n = e.getCursorPosition(),
                r = e.session.getLine(n.row),
                i = r.substring(0, n.column),
                s = r.substr(n.column),
                o = this.snippetMap,
                u;
            return this.getActiveScopes(e).some(function(e) {
                var t = o[e];
                return t && (u = this.findMatchingSnippet(t, i, s)), !!u
            }, this), u ? t && t.dryRun ? !0 : (e.session.doc.removeInLine(n.row, n.column - u.replaceBefore.length, n.column + u.replaceAfter.length), this.variables.M__ = u.matchBefore, this.variables.T__ = u.matchAfter, this.insertSnippetForSelection(e, u.content), this.variables.M__ = this.variables.T__ = null, !0) : !1
        }, this.findMatchingSnippet = function(e, t, n) {
            for (var r = e.length; r--;) {
                var i = e[r];
                if (i.startRe && !i.startRe.test(t)) continue;
                if (i.endRe && !i.endRe.test(n)) continue;
                if (!i.startRe && !i.endRe) continue;
                return i.matchBefore = i.startRe ? i.startRe.exec(t) : [""], i.matchAfter = i.endRe ? i.endRe.exec(n) : [""], i.replaceBefore = i.triggerRe ? i.triggerRe.exec(t)[0] : "", i.replaceAfter = i.endTriggerRe ? i.endTriggerRe.exec(n)[0] : "", i
            }
        }, this.snippetMap = {}, this.snippetNameMap = {}, this.register = function(e, t) {
            function o(e) {
                return e && !/^\^?\(.*\)\$?$|^\\b$/.test(e) && (e = "(?:" + e + ")"), e || ""
            }

            function u(e, t, n) {
                return e = o(e), t = o(t), n ? (e = t + e, e && e[e.length - 1] != "$" && (e += "$")) : (e += t, e && e[0] != "^" && (e = "^" + e)), new RegExp(e)
            }

            function a(e) {
                e.scope || (e.scope = t || "_"), t = e.scope, n[t] || (n[t] = [], r[t] = {});
                var o = r[t];
                if (e.name) {
                    var a = o[e.name];
                    a && i.unregister(a), o[e.name] = e
                }
                n[t].push(e), e.tabTrigger && !e.trigger && (!e.guard && /^\w/.test(e.tabTrigger) && (e.guard = "\\b"), e.trigger = s.escapeRegExp(e.tabTrigger)), e.startRe = u(e.trigger, e.guard, !0), e.triggerRe = new RegExp(e.trigger, "", !0), e.endRe = u(e.endTrigger, e.endGuard, !0), e.endTriggerRe = new RegExp(e.endTrigger, "", !0)
            }
            var n = this.snippetMap,
                r = this.snippetNameMap,
                i = this;
            e || (e = []), e && e.content ? a(e) : Array.isArray(e) && e.forEach(a), this._signal("registerSnippets", {
                scope: t
            })
        }, this.unregister = function(e, t) {
            function i(e) {
                var i = r[e.scope || t];
                if (i && i[e.name]) {
                    delete i[e.name];
                    var s = n[e.scope || t],
                        o = s && s.indexOf(e);
                    o >= 0 && s.splice(o, 1)
                }
            }
            var n = this.snippetMap,
                r = this.snippetNameMap;
            e.content ? i(e) : Array.isArray(e) && e.forEach(i)
        }, this.parseSnippetFile = function(e) {
            e = e.replace(/\r/g, "");
            var t = [],
                n = {},
                r = /^#.*|^({[\s\S]*})\s*$|^(\S+) (.*)$|^((?:\n*\t.*)+)/gm,
                i;
            while (i = r.exec(e)) {
                if (i[1]) try {
                    n = JSON.parse(i[1]), t.push(n)
                } catch (s) {}
                if (i[4]) n.content = i[4].replace(/^\t/gm, ""), t.push(n), n = {};
                else {
                    var o = i[2],
                        u = i[3];
                    if (o == "regex") {
                        var a = /\/((?:[^\/\\]|\\.)*)|$/g;
                        n.guard = a.exec(u)[1], n.trigger = a.exec(u)[1], n.endTrigger = a.exec(u)[1], n.endGuard = a.exec(u)[1]
                    } else o == "snippet" ? (n.tabTrigger = u.match(/^\S*/)[0], n.name || (n.name = u)) : n[o] = u
                }
            }
            return t
        }, this.getSnippetByName = function(e, t) {
            var n = this.snippetNameMap,
                r;
            return this.getActiveScopes(t).some(function(t) {
                var i = n[t];
                return i && (r = i[e]), !!r
            }, this), r
        }
    }).call(c.prototype);
    var h = function(e) {
        if (e.tabstopManager) return e.tabstopManager;
        e.tabstopManager = this, this.$onChange = this.onChange.bind(this), this.$onChangeSelection = s.delayedCall(this.onChangeSelection.bind(this)).schedule, this.$onChangeSession = this.onChangeSession.bind(this), this.$onAfterExec = this.onAfterExec.bind(this), this.attach(e)
    };
    (function() {
        this.attach = function(e) {
            this.index = 0, this.ranges = [], this.tabstops = [], this.$openTabstops = null, this.selectedTabstop = null, this.editor = e, this.editor.on("change", this.$onChange), this.editor.on("changeSelection", this.$onChangeSelection), this.editor.on("changeSession", this.$onChangeSession), this.editor.commands.on("afterExec", this.$onAfterExec), this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler)
        }, this.detach = function() {
            this.tabstops.forEach(this.removeTabstopMarkers, this), this.ranges = null, this.tabstops = null, this.selectedTabstop = null, this.editor.removeListener("change", this.$onChange), this.editor.removeListener("changeSelection", this.$onChangeSelection), this.editor.removeListener("changeSession", this.$onChangeSession), this.editor.commands.removeListener("afterExec", this.$onAfterExec), this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler), this.editor.tabstopManager = null, this.editor = null
        }, this.onChange = function(e) {
            var t = e.data.range,
                n = e.data.action[0] == "r",
                r = t.start,
                i = t.end,
                s = r.row,
                o = i.row,
                u = o - s,
                a = i.column - r.column;
            n && (u = -u, a = -a);
            if (!this.$inChange && n) {
                var f = this.selectedTabstop,
                    c = f && !f.some(function(e) {
                        return l(e.start, r) <= 0 && l(e.end, i) >= 0
                    });
                if (c) return this.detach()
            }
            var h = this.ranges;
            for (var p = 0; p < h.length; p++) {
                var d = h[p];
                if (d.end.row < r.row) continue;
                if (n && l(r, d.start) < 0 && l(i, d.end) > 0) {
                    this.removeRange(d), p--;
                    continue
                }
                d.start.row == s && d.start.column > r.column && (d.start.column += a), d.end.row == s && d.end.column >= r.column && (d.end.column += a), d.start.row >= s && (d.start.row += u), d.end.row >= s && (d.end.row += u), l(d.start, d.end) > 0 && this.removeRange(d)
            }
            h.length || this.detach()
        }, this.updateLinkedFields = function() {
            var e = this.selectedTabstop;
            if (!e || !e.hasLinkedRanges) return;
            this.$inChange = !0;
            var n = this.editor.session,
                r = n.getTextRange(e.firstNonLinked);
            for (var i = e.length; i--;) {
                var s = e[i];
                if (!s.linked) continue;
                var o = t.snippetManager.tmStrFormat(r, s.original);
                n.replace(s, o)
            }
            this.$inChange = !1
        }, this.onAfterExec = function(e) {
            e.command && !e.command.readOnly && this.updateLinkedFields()
        }, this.onChangeSelection = function() {
            if (!this.editor) return;
            var e = this.editor.selection.lead,
                t = this.editor.selection.anchor,
                n = this.editor.selection.isEmpty();
            for (var r = this.ranges.length; r--;) {
                if (this.ranges[r].linked) continue;
                var i = this.ranges[r].contains(e.row, e.column),
                    s = n || this.ranges[r].contains(t.row, t.column);
                if (i && s) return
            }
            this.detach()
        }, this.onChangeSession = function() {
            this.detach()
        }, this.tabNext = function(e) {
            var t = this.tabstops.length,
                n = this.index + (e || 1);
            n = Math.min(Math.max(n, 1), t), n == t && (n = 0), this.selectTabstop(n), n === 0 && this.detach()
        }, this.selectTabstop = function(e) {
            this.$openTabstops = null;
            var t = this.tabstops[this.index];
            t && this.addTabstopMarkers(t), this.index = e, t = this.tabstops[this.index];
            if (!t || !t.length) return;
            this.selectedTabstop = t;
            if (!this.editor.inVirtualSelectionMode) {
                var n = this.editor.multiSelect;
                n.toSingleRange(t.firstNonLinked.clone());
                for (var r = t.length; r--;) {
                    if (t.hasLinkedRanges && t[r].linked) continue;
                    n.addRange(t[r].clone(), !0)
                }
                n.ranges[0] && n.addRange(n.ranges[0].clone())
            } else this.editor.selection.setRange(t.firstNonLinked);
            this.editor.keyBinding.addKeyboardHandler(this.keyboardHandler)
        }, this.addTabstops = function(e, t, n) {
            this.$openTabstops || (this.$openTabstops = []);
            if (!e[0]) {
                var r = o.fromPoints(n, n);
                v(r.start, t), v(r.end, t), e[0] = [r], e[0].index = 0
            }
            var i = this.index,
                s = [i + 1, 0],
                u = this.ranges;
            e.forEach(function(e, n) {
                var r = this.$openTabstops[n] || e;
                for (var i = e.length; i--;) {
                    var a = e[i],
                        f = o.fromPoints(a.start, a.end || a.start);
                    d(f.start, t), d(f.end, t), f.original = a, f.tabstop = r, u.push(f), r != e ? r.unshift(f) : r[i] = f, a.fmtString ? (f.linked = !0, r.hasLinkedRanges = !0) : r.firstNonLinked || (r.firstNonLinked = f)
                }
                r.firstNonLinked || (r.hasLinkedRanges = !1), r === e && (s.push(r), this.$openTabstops[n] = r), this.addTabstopMarkers(r)
            }, this), s.length > 2 && (this.tabstops.length && s.push(s.splice(2, 1)[0]), this.tabstops.splice.apply(this.tabstops, s))
        }, this.addTabstopMarkers = function(e) {
            var t = this.editor.session;
            e.forEach(function(e) {
                e.markerId || (e.markerId = t.addMarker(e, "ace_snippet-marker", "text"))
            })
        }, this.removeTabstopMarkers = function(e) {
            var t = this.editor.session;
            e.forEach(function(e) {
                t.removeMarker(e.markerId), e.markerId = null
            })
        }, this.removeRange = function(e) {
            var t = e.tabstop.indexOf(e);
            e.tabstop.splice(t, 1), t = this.ranges.indexOf(e), this.ranges.splice(t, 1), this.editor.session.removeMarker(e.markerId), e.tabstop.length || (t = this.tabstops.indexOf(e.tabstop), t != -1 && this.tabstops.splice(t, 1), this.tabstops.length || this.detach())
        }, this.keyboardHandler = new a, this.keyboardHandler.bindKeys({
            Tab: function(e) {
                if (t.snippetManager && t.snippetManager.expandWithTab(e)) return;
                e.tabstopManager.tabNext(1)
            },
            "Shift-Tab": function(e) {
                e.tabstopManager.tabNext(-1)
            },
            Esc: function(e) {
                e.tabstopManager.detach()
            },
            Return: function(e) {
                return !1
            }
        })
    }).call(h.prototype);
    var p = {};
    p.onChange = u.prototype.onChange, p.setPosition = function(e, t) {
        this.pos.row = e, this.pos.column = t
    }, p.update = function(e, t, n) {
        this.$insertRight = n, this.pos = e, this.onChange(t)
    };
    var d = function(e, t) {
            e.row == 0 && (e.column += t.column), e.row += t.row
        },
        v = function(e, t) {
            e.row == t.row && (e.column -= t.column), e.row -= t.row
        };
    e("./lib/dom").importCssString(".ace_snippet-marker {    -moz-box-sizing: border-box;    box-sizing: border-box;    background: rgba(194, 193, 208, 0.09);    border: 1px dotted rgba(211, 208, 235, 0.62);    position: absolute;}"), t.snippetManager = new c;
    var m = e("./editor").Editor;
    (function() {
        this.insertSnippet = function(e, n) {
            return t.snippetManager.insertSnippet(this, e, n)
        }, this.expandSnippet = function(e) {
            return t.snippetManager.expandWithTab(this, e)
        }
    }).call(m.prototype)
}), define("ace/autocomplete/text_completer", ["require", "exports", "module", "ace/range"], function(e, t, n) {
    function s(e, t) {
        var n = e.getTextRange(r.fromPoints({
            row: 0,
            column: 0
        }, t));
        return n.split(i).length - 1
    }

    function o(e, t) {
        var n = s(e, t),
            r = e.getValue().split(i),
            o = Object.create(null),
            u = r[n];
        return r.forEach(function(e, t) {
            if (!e || e === u) return;
            var i = Math.abs(n - t),
                s = r.length - i;
            o[e] ? o[e] = Math.max(s, o[e]) : o[e] = s
        }), o
    }
    var r = e("../range").Range,
        i = /[^a-zA-Z_0-9\$\-\u00C0-\u1FFF\u2C00-\uD7FF\w]+/;
    t.getCompletions = function(e, t, n, r, i) {
        var s = o(t, n, r),
            u = Object.keys(s);
        i(null, u.map(function(e) {
            return {
                caption: e,
                value: e,
                score: s[e],
                meta: "local"
            }
        }))
    }
}), define("ace/autocomplete/popup", ["require", "exports", "module", "ace/edit_session", "ace/virtual_renderer", "ace/editor", "ace/range", "ace/lib/event", "ace/lib/lang", "ace/lib/dom"], function(e, t, n) {
    "use strict";
    var r = e("../edit_session").EditSession,
        i = e("../virtual_renderer").VirtualRenderer,
        s = e("../editor").Editor,
        o = e("../range").Range,
        u = e("../lib/event"),
        a = e("../lib/lang"),
        f = e("../lib/dom"),
        l = function(e) {
            var t = new i(e);
            t.$maxLines = 4;
            var n = new s(t);
            return n.setHighlightActiveLine(!1), n.setShowPrintMargin(!1), n.renderer.setShowGutter(!1), n.renderer.setHighlightGutterLine(!1), n.$mouseHandler.$focusWaitTimout = 0, n.$highlightTagPending = !0, n
        },
        c = function(e) {
            var t = f.createElement("div"),
                n = new l(t);
            e && e.appendChild(t), t.style.display = "none", n.renderer.content.style.cursor = "default", n.renderer.setStyle("ace_autocomplete"), n.setOption("displayIndentGuides", !1), n.setOption("dragDelay", 150);
            var r = function() {};
            n.focus = r, n.$isFocused = !0, n.renderer.$cursorLayer.restartTimer = r, n.renderer.$cursorLayer.element.style.opacity = 0, n.renderer.$maxLines = 8, n.renderer.$keepTextAreaAtCursor = !1, n.setHighlightActiveLine(!1), n.session.highlight(""), n.session.$searchHighlight.clazz = "ace_highlight-marker", n.on("mousedown", function(e) {
                var t = e.getDocumentPosition();
                n.selection.moveToPosition(t), c.start.row = c.end.row = t.row, e.stop()
            });
            var i, s = new o(-1, 0, -1, Infinity),
                c = new o(-1, 0, -1, Infinity);
            c.id = n.session.addMarker(c, "ace_active-line", "fullLine"), n.setSelectOnHover = function(e) {
                e ? s.id && (n.session.removeMarker(s.id), s.id = null) : s.id = n.session.addMarker(s, "ace_line-hover", "fullLine")
            }, n.setSelectOnHover(!1), n.on("mousemove", function(e) {
                if (!i) {
                    i = e;
                    return
                }
                if (i.x == e.x && i.y == e.y) return;
                i = e, i.scrollTop = n.renderer.scrollTop;
                var t = i.getDocumentPosition().row;
                s.start.row != t && (s.id || n.setRow(t), p(t))
            }), n.renderer.on("beforeRender", function() {
                if (i && s.start.row != -1) {
                    i.$pos = null;
                    var e = i.getDocumentPosition().row;
                    s.id || n.setRow(e), p(e, !0)
                }
            }), n.renderer.on("afterRender", function() {
                var e = n.getRow(),
                    t = n.renderer.$textLayer,
                    r = t.element.childNodes[e - t.config.firstRow];
                if (r == t.selectedNode) return;
                t.selectedNode && f.removeCssClass(t.selectedNode, "ace_selected"), t.selectedNode = r, r && f.addCssClass(r, "ace_selected")
            });
            var h = function() {
                    p(-1)
                },
                p = function(e, t) {
                    e !== s.start.row && (s.start.row = s.end.row = e, t || n.session._emit("changeBackMarker"), n._emit("changeHoverMarker"))
                };
            n.getHoveredRow = function() {
                return s.start.row
            }, u.addListener(n.container, "mouseout", h), n.on("hide", h), n.on("changeSelection", h), n.session.doc.getLength = function() {
                return n.data.length
            }, n.session.doc.getLine = function(e) {
                var t = n.data[e];
                return typeof t == "string" ? t : t && t.value || ""
            };
            var d = n.session.bgTokenizer;
            return d.$tokenizeRow = function(e) {
                var t = n.data[e],
                    r = [];
                if (!t) return r;
                typeof t == "string" && (t = {
                    value: t
                }), t.caption || (t.caption = t.value || t.name);
                var i = -1,
                    s, o;
                t.iconClass && r.push({
                    type: t.iconClass,
                    value: " "
                });
                for (var u = 0; u < t.caption.length; u++) o = t.caption[u], s = t.matchMask & 1 << u ? 1 : 0, i !== s ? (r.push({
                    type: t.className || "" + (s ? "completion-highlight" : ""),
                    value: o
                }), i = s) : r[r.length - 1].value += o;
                if (t.meta) {
                    var a = n.renderer.$size.scrollerWidth / n.renderer.layerConfig.characterWidth,
                        f = t.meta;
                    f.length + t.caption.length > a - 2 && (f = f.substr(0, a - t.caption.length - 3) + "\u2026"), r.push({
                        type: "rightAlignedText",
                        value: f
                    })
                }
                return r
            }, d.$updateOnChange = r, d.start = r, n.session.$computeWidth = function() {
                return this.screenWidth = 0
            }, n.$blockScrolling = Infinity, n.isOpen = !1, n.isTopdown = !1, n.data = [], n.setData = function(e) {
                n.data = e || [], n.setValue(a.stringRepeat("\n", e.length), -1), n.setRow(0)
            }, n.getData = function(e) {
                return n.data[e]
            }, n.getRow = function() {
                return c.start.row
            }, n.setRow = function(e) {
                e = Math.max(-1, Math.min(this.data.length, e)), c.start.row != e && (n.selection.clearSelection(), c.start.row = c.end.row = e || 0, n.session._emit("changeBackMarker"), n.moveCursorTo(e || 0, 0), n.isOpen && n._signal("select"))
            }, n.on("changeSelection", function() {
                n.isOpen && n.setRow(n.selection.lead.row), n.renderer.scrollCursorIntoView()
            }), n.hide = function() {
                this.container.style.display = "none", this._signal("hide"), n.isOpen = !1
            }, n.show = function(e, t, r) {
                var s = this.container,
                    o = window.innerHeight,
                    u = window.innerWidth,
                    a = this.renderer,
                    f = a.$maxLines * t * 1.4,
                    l = e.top + this.$borderSize;
                l + f > o - t && !r ? (s.style.top = "", s.style.bottom = o - l + "px", n.isTopdown = !1) : (l += t, s.style.top = l + "px", s.style.bottom = "", n.isTopdown = !0), s.style.display = "", this.renderer.$textLayer.checkForSizeChanges();
                var c = e.left;
                c + s.offsetWidth > u && (c = u - s.offsetWidth), s.style.left = c + "px", this._signal("show"), i = null, n.isOpen = !0
            }, n.getTextLeftOffset = function() {
                return this.$borderSize + this.renderer.$padding + this.$imageSize
            }, n.$imageSize = 0, n.$borderSize = 1, n
        };
    f.importCssString(".ace_editor.ace_autocomplete .ace_marker-layer .ace_active-line {    background-color: #CAD6FA;    z-index: 1;}.ace_editor.ace_autocomplete .ace_line-hover {    border: 1px solid #abbffe;    margin-top: -1px;    background: rgba(233,233,253,0.4);}.ace_editor.ace_autocomplete .ace_line-hover {    position: absolute;    z-index: 2;}.ace_editor.ace_autocomplete .ace_scroller {   background: none;   border: none;   box-shadow: none;}.ace_rightAlignedText {    color: gray;    display: inline-block;    position: absolute;    right: 4px;    text-align: right;    z-index: -1;}.ace_editor.ace_autocomplete .ace_completion-highlight{    color: #000;    text-shadow: 0 0 0.01em;}.ace_editor.ace_autocomplete {    width: 280px;    z-index: 200000;    background: #fbfbfb;    color: #444;    border: 1px lightgray solid;    position: fixed;    box-shadow: 2px 3px 5px rgba(0,0,0,.2);    line-height: 1.4;}"), t.AcePopup = c
}), define("ace/autocomplete/util", ["require", "exports", "module"], function(e, t, n) {
    "use strict";
    t.parForEach = function(e, t, n) {
        var r = 0,
            i = e.length;
        i === 0 && n();
        for (var s = 0; s < i; s++) t(e[s], function(e, t) {
            r++, r === i && n(e, t)
        })
    };
    var r = /[a-zA-Z_0-9\$\-\u00A2-\uFFFF]/;
    t.retrievePrecedingIdentifier = function(e, t, n) {
        n = n || r;
        var i = [];
        for (var s = t - 1; s >= 0; s--) {
            if (!n.test(e[s])) break;
            i.push(e[s])
        }
        return i.reverse().join("")
    }, t.retrieveFollowingIdentifier = function(e, t, n) {
        n = n || r;
        var i = [];
        for (var s = t; s < e.length; s++) {
            if (!n.test(e[s])) break;
            i.push(e[s])
        }
        return i
    }
}), define("ace/autocomplete", ["require", "exports", "module", "ace/keyboard/hash_handler", "ace/autocomplete/popup", "ace/autocomplete/util", "ace/lib/event", "ace/lib/lang", "ace/lib/dom", "ace/snippets"], function(e, t, n) {
    "use strict";
    var r = e("./keyboard/hash_handler").HashHandler,
        i = e("./autocomplete/popup").AcePopup,
        s = e("./autocomplete/util"),
        o = e("./lib/event"),
        u = e("./lib/lang"),
        a = e("./lib/dom"),
        f = e("./snippets").snippetManager,
        l = function() {
            this.autoInsert = !1, this.autoSelect = !0, this.exactMatch = !1, this.gatherCompletionsId = 0, this.keyboardHandler = new r, this.keyboardHandler.bindKeys(this.commands), this.blurListener = this.blurListener.bind(this), this.changeListener = this.changeListener.bind(this), this.mousedownListener = this.mousedownListener.bind(this), this.mousewheelListener = this.mousewheelListener.bind(this), this.changeTimer = u.delayedCall(function() {
                this.updateCompletions(!0)
            }.bind(this)), this.tooltipTimer = u.delayedCall(this.updateDocTooltip.bind(this), 50)
        };
    (function() {
        this.$init = function() {
            return this.popup = new i(document.body || document.documentElement), this.popup.on("click", function(e) {
                this.insertMatch(), e.stop()
            }.bind(this)), this.popup.focus = this.editor.focus.bind(this.editor), this.popup.on("show", this.tooltipTimer.bind(null, null)), this.popup.on("select", this.tooltipTimer.bind(null, null)), this.popup.on("changeHoverMarker", this.tooltipTimer.bind(null, null)), this.popup
        }, this.getPopup = function() {
            return this.popup || this.$init()
        }, this.openPopup = function(e, t, n) {
            this.popup || this.$init(), this.popup.setData(this.completions.filtered), e.keyBinding.addKeyboardHandler(this.keyboardHandler);
            var r = e.renderer;
            this.popup.setRow(this.autoSelect ? 0 : -1);
            if (!n) {
                this.popup.setTheme(e.getTheme()), this.popup.setFontSize(e.getFontSize());
                var i = r.layerConfig.lineHeight,
                    s = r.$cursorLayer.getPixelPosition(this.base, !0);
                s.left -= this.popup.getTextLeftOffset();
                var o = e.container.getBoundingClientRect();
                s.top += o.top - r.layerConfig.offset, s.left += o.left - e.renderer.scrollLeft, s.left += r.$gutterLayer.gutterWidth, this.popup.show(s, i)
            } else n && !t && this.detach()
        }, this.detach = function() {
            this.editor.keyBinding.removeKeyboardHandler(this.keyboardHandler), this.editor.off("changeSelection", this.changeListener), this.editor.off("blur", this.blurListener), this.editor.off("mousedown", this.mousedownListener), this.editor.off("mousewheel", this.mousewheelListener), this.changeTimer.cancel(), this.hideDocTooltip(), this.gatherCompletionsId += 1, this.popup && this.popup.isOpen && this.popup.hide(), this.base && this.base.detach(), this.activated = !1, this.completions = this.base = null
        }, this.changeListener = function(e) {
            var t = this.editor.selection.lead;
            (t.row != this.base.row || t.column < this.base.column) && this.detach(), this.activated ? this.changeTimer.schedule() : this.detach()
        }, this.blurListener = function(e) {
            var t = document.activeElement,
                n = this.editor.textInput.getElement();
            t != n && (!this.popup || t.parentNode != this.popup.container) && t != this.tooltipNode && e.relatedTarget != this.tooltipNode && e.relatedTarget != n && this.detach()
        }, this.mousedownListener = function(e) {
            this.detach()
        }, this.mousewheelListener = function(e) {
            this.detach()
        }, this.goTo = function(e) {
            var t = this.popup.getRow(),
                n = this.popup.session.getLength() - 1;
            switch (e) {
                case "up":
                    t = t <= 0 ? n : t - 1;
                    break;
                case "down":
                    t = t >= n ? -1 : t + 1;
                    break;
                case "start":
                    t = 0;
                    break;
                case "end":
                    t = n
            }
            this.popup.setRow(t)
        }, this.insertMatch = function(e) {
            e || (e = this.popup.getData(this.popup.getRow()));
            if (!e) return !1;
            if (e.completer && e.completer.insertMatch) e.completer.insertMatch(this.editor, e);
            else {
                if (this.completions.filterText) {
                    var t = this.editor.selection.getAllRanges();
                    for (var n = 0, r; r = t[n]; n++) r.start.column -= this.completions.filterText.length, this.editor.session.remove(r)
                }
                e.snippet ? f.insertSnippet(this.editor, e.snippet) : this.editor.execCommand("insertstring", e.value || e)
            }
            this.detach()
        }, this.commands = {
            Up: function(e) {
                e.completer.goTo("up")
            },
            Down: function(e) {
                e.completer.goTo("down")
            },
            "Ctrl-Up|Ctrl-Home": function(e) {
                e.completer.goTo("start")
            },
            "Ctrl-Down|Ctrl-End": function(e) {
                e.completer.goTo("end")
            },
            Esc: function(e) {
                e.completer.detach()
            },
            Return: function(e) {
                return e.completer.insertMatch()
            },
            "Shift-Return": function(e) {
                e.completer.insertMatch(!0)
            },
            Tab: function(e) {
                var t = e.completer.insertMatch();
                if (!!t || !!e.tabstopManager) return t;
                e.completer.goTo("down")
            },
            PageUp: function(e) {
                e.completer.popup.gotoPageUp()
            },
            PageDown: function(e) {
                e.completer.popup.gotoPageDown()
            }
        }, this.gatherCompletions = function(e, t) {
            var n = e.getSession(),
                r = e.getCursorPosition(),
                i = n.getLine(r.row),
                o = s.retrievePrecedingIdentifier(i, r.column);
            this.base = n.doc.createAnchor(r.row, r.column - o.length), this.base.$insertRight = !0;
            var u = [],
                a = e.completers.length;
            return e.completers.forEach(function(i, f) {
                i.getCompletions(e, n, r, o, function(r, i) {
                    r || (u = u.concat(i));
                    var o = e.getCursorPosition(),
                        f = n.getLine(o.row);
                    t(null, {
                        prefix: s.retrievePrecedingIdentifier(f, o.column, i[0] && i[0].identifierRegex),
                        matches: u,
                        finished: --a === 0
                    })
                })
            }), !0
        }, this.showPopup = function(e) {
            this.editor && this.detach(), this.activated = !0, this.editor = e, e.completer != this && (e.completer && e.completer.detach(), e.completer = this), e.on("changeSelection", this.changeListener), e.on("blur", this.blurListener), e.on("mousedown", this.mousedownListener), e.on("mousewheel", this.mousewheelListener), this.updateCompletions()
        }, this.updateCompletions = function(e) {
            if (e && this.base && this.completions) {
                var t = this.editor.getCursorPosition(),
                    n = this.editor.session.getTextRange({
                        start: this.base,
                        end: t
                    });
                if (n == this.completions.filterText) return;
                this.completions.setFilter(n);
                if (!this.completions.filtered.length) return this.detach();
                if (this.completions.filtered.length == 1 && this.completions.filtered[0].value == n && !this.completions.filtered[0].snippet) return this.detach();
                this.openPopup(this.editor, n, e);
                return
            }
            var r = this.gatherCompletionsId;
            this.gatherCompletions(this.editor, function(t, n) {
                var i = function() {
                        if (!n.finished) return;
                        return this.detach()
                    }.bind(this),
                    s = n.prefix,
                    o = n && n.matches;
                if (!o || !o.length) return i();
                if (s.indexOf(n.prefix) !== 0 || r != this.gatherCompletionsId) return;
                this.completions = new c(o), this.exactMatch && (this.completions.exactMatch = !0), this.completions.setFilter(s);
                var u = this.completions.filtered;
                if (!u.length) return i();
                if (u.length == 1 && u[0].value == s && !u[0].snippet) return i();
                if (this.autoInsert && u.length == 1 && n.finished) return this.insertMatch(u[0]);
                this.openPopup(this.editor, s, e)
            }.bind(this))
        }, this.cancelContextMenu = function() {
            this.editor.$mouseHandler.cancelContextMenu()
        }, this.updateDocTooltip = function() {
            var e = this.popup,
                t = e.data,
                n = t && (t[e.getHoveredRow()] || t[e.getRow()]),
                r = null;
            if (!n || !this.editor || !this.popup.isOpen) return this.hideDocTooltip();
            this.editor.completers.some(function(e) {
                return e.getDocTooltip && (r = e.getDocTooltip(n)), r
            }), r || (r = n), typeof r == "string" && (r = {
                docText: r
            });
            if (!r || !r.docHTML && !r.docText) return this.hideDocTooltip();
            this.showDocTooltip(r)
        }, this.showDocTooltip = function(e) {
            this.tooltipNode || (this.tooltipNode = a.createElement("div"), this.tooltipNode.className = "ace_tooltip ace_doc-tooltip", this.tooltipNode.style.margin = 0, this.tooltipNode.style.pointerEvents = "auto", this.tooltipNode.tabIndex = -1, this.tooltipNode.onblur = this.blurListener.bind(this));
            var t = this.tooltipNode;
            e.docHTML ? t.innerHTML = e.docHTML : e.docText && (t.textContent = e.docText), t.parentNode || document.body.appendChild(t);
            var n = this.popup,
                r = n.container.getBoundingClientRect();
            t.style.top = n.container.style.top, t.style.bottom = n.container.style.bottom, window.innerWidth - r.right < 320 ? (t.style.right = window.innerWidth - r.left + "px", t.style.left = "") : (t.style.left = r.right + 1 + "px", t.style.right = ""), t.style.display = "block"
        }, this.hideDocTooltip = function() {
            this.tooltipTimer.cancel();
            if (!this.tooltipNode) return;
            var e = this.tooltipNode;
            !this.editor.isFocused() && document.activeElement == e && this.editor.focus(), this.tooltipNode = null, e.parentNode && e.parentNode.removeChild(e)
        }
    }).call(l.prototype), l.startCommand = {
        name: "startAutocomplete",
        exec: function(e) {
            e.completer || (e.completer = new l), e.completer.autoInsert = !1, e.completer.autoSelect = !0, e.completer.showPopup(e), e.completer.cancelContextMenu()
        },
        bindKey: "Ctrl-Space|Ctrl-Shift-Space|Alt-Space"
    };
    var c = function(e, t, n) {
        this.all = e, this.filtered = e, this.filterText = t || "", this.exactMatch = !1
    };
    (function() {
        this.setFilter = function(e) {
            if (e.length > this.filterText && e.lastIndexOf(this.filterText, 0) === 0) var t = this.filtered;
            else var t = this.all;
            this.filterText = e, t = this.filterCompletions(t, this.filterText), t = t.sort(function(e, t) {
                return t.exactMatch - e.exactMatch || t.score - e.score
            });
            var n = null;
            t = t.filter(function(e) {
                var t = e.snippet || e.caption || e.value;
                return t === n ? !1 : (n = t, !0)
            }), this.filtered = t
        }, this.filterCompletions = function(e, t) {
            var n = [],
                r = t.toUpperCase(),
                i = t.toLowerCase();
            e: for (var s = 0, o; o = e[s]; s++) {
                var u = o.value || o.caption || o.snippet;
                if (!u) continue;
				if( u.indexOf("_")>-1 ) continue; //DH:
                var a = -1,
                    f = 0,
                    l = 0,
                    c, h;
                if (this.exactMatch) {
                    if (t !== u.substr(0, t.length)) continue e
                } else
                    for (var p = 0; p < t.length; p++) {
                        var d = u.indexOf(i[p], a + 1),
                            v = u.indexOf(r[p], a + 1);
                        c = d >= 0 ? v < 0 || d < v ? d : v : v;
                        if (c < 0) continue e;
                        h = c - a - 1, h > 0 && (a === -1 && (l += 10), l += h), f |= 1 << c, a = c
                    }
                o.matchMask = f, o.exactMatch = l ? 0 : 1, o.score = (o.score || 0) - l, n.push(o)
            }
            return n
        }
    }).call(c.prototype), t.Autocomplete = l, t.FilteredList = c
}), define("ace/tern/tern_server", ["require", "exports", "module", "ace/range", "ace/lib/dom"], function(require, exports, module) {
    "use strict";

    function resolveFilePath(e, t, n) {
        e.options.resolveFilePath ? e.options.resolveFilePath(t, n) : n(t)
    }

    function getFile(e, t, n) {
        var r = e.docs[t];
        r ? n(docValue(e, r)) : e.options.getFile ? e.options.getFile(t, n) : n(null)
    }

    function findDoc(e, t, n) {
        var r = null;
        t instanceof EditSession ? r = t : r = t.getSession();
        for (var i in e.docs) {
            var s = e.docs[i];
            if (s.session == r) return s
        }
        if (!n)
            for (var o = 0;; ++o) {
                i = "[doc" + (o || "") + "]";
                if (!e.docs[i]) {
                    n = i;
                    break
                }
            }
        return e.addDoc(n, r)
    }

    function toTernLoc(e) {
        return typeof e.row != "undefined" ? {
            line: e.row,
            ch: e.column
        } : e
    }

    function toAceLoc(e) {
        return e.line ? {
            row: e.line,
            column: e.ch
        } : e
    }

    function buildRequest(e, t, n, r, i) {
        var s = [],
            o = 0,
            u = !n.fullDocs;
        u || delete n.fullDocs, typeof n == "string" && (n = {
            type: n
        }), n.lineCharPositions = !0;
        if (n.end == null) {
            var a = t.session.getSelection().getRange();
            n.end = toTernLoc(r || a.end), a.start != a.end && (n.start = toTernLoc(a.start))
        }
        var f = n.start || n.end;
        if (t.changed)
            if (!i && t.session.getLength() > bigDoc && u !== !1 && t.changed.to - t.changed.from < 100 && t.changed.from <= f.line && t.changed.to > n.end.line) {
                s.push(getFragmentAround(t, f, n.end)), n.file = "#0";
                var o = s[0].offsetLines;
                n.start != null && (n.start = Pos(n.start.line - -o, n.start.ch)), n.end = Pos(n.end.line - o, n.end.ch)
            } else s.push({
                type: "full",
                name: t.name,
                text: docValue(e, t)
            }), n.file = t.name, t.changed = null;
        else n.file = t.name;
        for (var l in e.docs) {
            var c = e.docs[l];
            c.changed && c != t && (s.push({
                type: "full",
                name: c.name,
                text: docValue(e, c)
            }), c.changed = null)
        }
        return {
            query: n,
            files: s,
            timeout: e.queryTimeout
        }
    }

    function getFragmentAround(e, t, n) {
        var r = e.session,
            i = null,
            s = null,
            o, u = r.$tabSize;
        for (var a = t.line - 1, f = Math.max(0, a - 50); a >= f; --a) {
            var l = r.getLine(a),
                c = l.search(/\bfunction\b/);
            if (c < 0) continue;
            var h = countColumn(l, null, u);
            if (i != null && i <= h) continue;
            i = h, s = a
        }
        s == null && (s = f);
        var p = Math.min(r.getLength() - 1, n.line + 20);
        if (i == null || i == countColumn(r.getLine(t.line), null, u)) o = p;
        else
            for (o = n.line + 1; o < p; ++o) {
                var h = countColumn(r.getLine(o), null, u);
                if (h <= i) break
            }
        var d = Pos(s, 0);
        return {
            type: "part",
            name: e.name,
            offsetLines: d.line,
            text: r.getTextRange({
                start: toAceLoc(d),
                end: toAceLoc(Pos(o, 0))
            })
        }
    }

    function countColumn(e, t, n, r, i) {
        t == null && (t = e.search(/[^\s\u00a0]/), t == -1 && (t = e.length));
        for (var s = r || 0, o = i || 0; s < t; ++s) e.charAt(s) == "	" ? o += n - o % n : ++o;
        return o
    }

    function docValue(e, t) {
        var n = t.session.getValue();
        return e.options.fileFilter && (n = e.options.fileFilter(n, t.name, t.session)), n
    }

    function typeToIcon(e) {
        var t;
        return e == "?" ? t = "unknown" : e == "number" || e == "string" || e == "bool" ? t = e : /^fn\(/.test(e) ? t = "fn" : /^\[/.test(e) ? t = "array" : t = "object", cls + "completion " + cls + "completion-" + t
    }

    function getCompletions(e, t, n, r, i, s) {
        var o = function() {
                try {
                    var t = e.lastAutoCompleteFireTime;
                    if (!t) return !1;
                    var n = (new Date).getTime() - t;
                    if (n < 1e3) return !0
                } catch (r) {
                    showError({
                        msg: "autoCompleteFiredTwiceInThreshold",
                        err: r
                    })
                }
                return !1
            },
            u = o();
        if (!u) {
            var a = getCurrentToken(t);
            a && a.type && a.type.indexOf("comment") !== -1 && (u = !0)
        }
        var f = "";
        debugCompletions && (f = Math.random().toString(36).slice(2), console.group(f), console.time("get completions from tern server")), e.request(t, {
            type: "completions",
            types: !0,
            origins: !0,
            docs: !0,
            filter: !1,
            omitObjectPrototype: !1,
            sort: !0,
            includeKeywords: !0,
            guess: !0,
            expandWordForward: !0
        }, function(o, a) {
            function E() {
                if (popupSelectBound) return !1;
                if (!t.completer.popup) {
                    setTimeout(E, 100);
                    return
                }
                t.completer.popup.on("select", S), t.completer.popup.on("hide", function() {
                    closeAllTips()
                }), S(), popupSelectBound = !0
            }

            function S() {
                closeAllTips();
                if (t.completer.popup) {
                    var e = t.completer.popup.getData(t.completer.popup.getRow());
                    if (!e || !e.doc) return;
                    var n = t.completer.popup.renderer.getContainerElement();
                    w = makeTooltip(n.getBoundingClientRect().right + window.pageXOffset, n.getBoundingClientRect().top + window.pageYOffset, createInfoDataTip(e, !0), t), w.className += " " + cls + "hint-doc"
                }
            }
            debugCompletions && console.timeEnd("get completions from tern server");
            if (o) return showError(e, t, o);
            var l = 99999,
                c = a.completions.map(function(e) {
                    return {
                        doc: e.doc,
                        type: e.type,
                        caption: e.name,
                        value: e.name,
                        score: l--,
                        meta: e.origin ? e.origin.replace(/^.*[\\\/]/, "") : "tern"
                    }
                });
            debugCompletions && console.time("get and merge other completions");
            var h = [];
            if (t.getOption("enableBasicAutocompletion") === !0) try {
                h = t.session.$mode.getCompletions()
            } catch (p) {}
            if (u && e.aceTextCompletor) {
                debugCompletions && console.time("aceTextCompletor");
                var d = [];
                try {
                    e.aceTextCompletor.getCompletions(t, n, r, i, function(e, t) {
                        d = t.map(function(e) {
                            return {
                                doc: e.doc,
                                type: e.type,
                                caption: e.caption,
                                value: e.value,
                                meta: "localText"
                            }
                        });
                        var n = function(e, t) {
                            e = e.toLowerCase().trim();
                            if (e.length < 2) return !0;
                            var n = !1;
                            for (var r = 0; r < h.length; r++)
                                if (h[r].value.toString().toLowerCase() == e) {
                                    n = !0;
                                    break
                                }
                            return n
                        };
                        for (var r = 0; r < d.length; r++) {
                            var i = d[r];
                            if (n(i.value)) continue;
                            h.push(i)
                        }
                    })
                } catch (p) {
                    showError(e, t, {
                        msg: "ace text completor error",
                        err: p
                    })
                }
                debugCompletions && console.timeEnd("aceTextCompletor")
            }
            if (h.length > 0) {
                var v = c.slice();
                for (var m = 0; m < h.length; m++) {
                    var g = h[m],
                        y = !1;
                    for (var b = 0; b < c.length; b++)
                        if (c[b].value.toString() === g.value.toString()) {
                            y = !0;
                            break
                        }
                    y || v.push(g)
                }
                c = v.slice()
            }
            debugCompletions && console.timeEnd("get and merge other completions"), s(null, c), debugCompletions && console.groupEnd(f);
            var w = null;
            E() || S();
            try {
                e.lastAutoCompleteFireTime = (new Date).getTime()
            } catch (p) {
                showError(e, t, {
                    msg: "error with last autoCompleteFireTime ",
                    err: p
                })
            }
        })
    }

    function showType(e, t, n, r) {
        if (r) {
            if (t.completer && t.completer.popup && t.completer.popup.isOpen) return;
            if (!isOnFunctionCall(t)) return
        } else if (!inJavascriptMode(t)) return;
        var i = function(s, o, u) {
            var a = "";
            if (s) {
                if (r) return;
                return showError(e, t, s)
            }
            if (e.options.typeTip) a = e.options.typeTip(o);
            else {
                if (r) {
                    if (o.hasOwnProperty("guess") && o.guess === !0) return;
                    if (o.type == "?" || o.type == "string" || o.type == "number" || o.type == "bool" || o.type == "date" || o.type == "fn(document: ?)" || o.type == "fn()") return
                }
                if (o.hasOwnProperty("type")) {
                    if (o.type == "?") return;
                    if (o.type.toString().length > 1 && o.type.toString().substr(0, 2) !== "fn") {
                        var f = function(e, t) {
                            i(e, t, o)
                        };
                        e.request(t, "definition", f, n, !1, null);
                        return
                    }
                } else u && u.hasOwnProperty("type") && (o.type = u.type, o.name = u.name, o.exprName = u.exprName)
            }
            a = createInfoDataTip(o, !0), a.innerHTML !== "" && setTimeout(function() {
                var e = getCusorPosForTooltip(t);
                makeTooltip(e.left, e.top, a, t, !0)
            }, 10)
        };
        e.request(t, "type", i, n, !r)
    }

    function createInfoDataTip(e, t, n) {
        var r = elt("span", null),
            i = e.session,
            s = e.params || parseJsDocParams(i);
			//alert( JSON.stringify(e))
        if (t) {
            var o = e.fnArgs ? e.fnArgs : e.type ? parseFnType(e.type) : null;
            if (o) {
                var u = function(e, t) {
                        if (s === null) return null;
                        if (!e.name) return null;
                        var n = [];
                        for (var r = 0; r < s.length; r++)
                            if (t === !0) s[r].parentName.toLowerCase().trim() === e.name.toLowerCase().trim() && n.push(s[r]);
                            else if (s[r].name.toLowerCase().trim() === e.name.toLowerCase().trim()) return s[r];
                        return t === !0 ? n : null
                    },
                    a = function(e) {
                        var t = e.name;
                        return e.optional === !0 && (e.defaultValue ? t = "[" + t + "=" + e.defaultValue + "]" : t = "[" + t + "]"), t
                    },
                    f = s.length === 0 || !isNaN(parseInt(n)),
                    l = "";
					
					if( e.doc && e.doc.indexOf("#")==0 ) {  //DH:
					//if( e.exprName && e.origin && e.origin.indexOf(".")==-1 ) {
					
						var pType = e.doc.indexOf(" ")<0 ? e.doc.substr(1) : e.meta ? e.meta.replace(".js","") : ""; 
						//alert( JSON.stringify(e) )
						l += htmlEncode( pType+"."+ (e.exprName || e.name || e.caption)), l += o.args.length > 0 ? "( " : "(";
						//l += htmlEncode( e.origin.toLowerCase()+"."+ e.exprName), l += o.args.length > 0 ? "( " : "(";
					}
					else l += htmlEncode(e.exprName || e.name || "fn"), l += o.args.length > 0 ? "( " : "(";
					
                var c = null,
                    h = [];
                for (var p = 0; p < o.args.length; p++) {
                    var d = "",
                        v = isNaN(parseInt(n)) ? !1 : p === n,
                        m = o.args[p],
                        g = m.name || "?";
                    g.length > 1 && g.substr(g.length - 1) === "?" && (g = g.substr(0, g.length - 1), m.name = g);
                    if (!f) d += htmlEncode(g);
                    else {
                        var y = u(m, !1),
                            b = u(m, !0),
                            w = m.type,
                            E = !1,
                            S = "";
                        y !== null && (g = y.name, y.type && (w = y.type), v && (c = y), E = y.optional, S = y.defaultValue.trim());
                        if (b && b.length > 0) {
                            v && (h = b), w = "{";
                            for (var x = 0; x < b.length; x++) w += b[x].name, x + 1 !== b.length && b.length > 1 && (w += ", ");
                            w += "}"
                        }
                        d += '<span class="' + cls + (v ? "farg-current" : "farg") + '">' + (htmlEncode(g) || "?") + "</span>", S !== "" && (d += '<span class="' + cls + 'jsdoc-param-defaultValue">=' + htmlEncode(S) + "</span>"), E && (d = '<span class="' + cls + 'jsdoc-param-optionalWrapper">' + '<span class="' + cls + 'farg-optionalBracket">[</span>' + d + '<span class="' + cls + 'jsdoc-param-optionalBracket">]</span>' + "</span>")
                    }
                    p > 0 && (d = ", " + d), l += d
                }
                l += o.args.length > 0 ? " )" : ")", o.rettype && (f ? l += ' -> <span class="' + cls + 'type">' + htmlEncode(o.rettype) + "</span>" : l += " -> " + htmlEncode(o.rettype)), l = '<span class="' + cls + (f ? "typeHeader" : "typeHeader-simple") + '">' + l + "</span>";
                if (f) {
                    c && c.description && (l += '<div class="' + cls + 'farg-current-description"><span class="' + cls + 'farg-current-name">' + c.name + ": </span>" + c.description + "</div>");
                    if (h && h.length > 0)
                        for (var p = 0; p < h.length; p++) {
                            var T = h[p].type ? '<span class="' + cls + 'type">{' + h[p].type + "} </span>" : "";
                            l += '<div class="' + cls + 'farg-current-description">' + T + '<span class="' + cls + 'farg-current-name">' + a(h[p]) + ": </span>" + h[p].description + "</div>"
                        }
                }
				
				//DH:
				//l += e.doc.substr(e.doc.indexOf("@desc")+6,e.doc.indexOf("@param")-6); //DH:
				if( e.doc && e.doc.indexOf("#")==0 ) {
				//if( e.exprName && e.origin && e.origin.indexOf(".")==-1 ) {
					//alert( JSON.stringify(e) )
					var pType = e.doc.substr(1); //DH:
					var desc = (e.exprName || e.name || e.caption);
					if( pType ) l += ( e.doc.indexOf(" ")<0 ? ds_transDesc( pType, desc ) : pType ); //DH:
					//l += ds_transDesc( e.origin, e.exprName ) //DH:
				}
				
                r.appendChild(elFromString(l))
            }
        }
        if (isNaN(parseInt(n))) {
            if (e.session) {
                var N = function(e, t) {
                        if (t.length === 0) return e;
                        e = e.replace(/@param/gi, "@param");
                        var n = e.substr(0, e.indexOf("@param"));
                        while (e.indexOf("@param") !== -1) e = e.substring(e.indexOf("@param") + 6);
                        e.indexOf("@") !== -1 ? e = e.substr(e.indexOf("@")) : e = "";
                        var r = "";
                        for (var i = 0; i < t.length; i++) {
                            r += "<div>", t[i].parentName.trim() === "" ? r += ' <span class="' + cls + 'jsdoc-tag">@param</span> ' : r += '<span class="' + cls + 'jsdoc-tag-param-child">&nbsp;</span> ', r += t[i].type.trim() === "" ? "" : '<span class="' + cls + 'type">{' + t[i].type + "}</span> ";
                            if (t[i].name.trim() !== "") {
                                var s = t[i].name.trim();
                                t[i].parentName.trim() !== "" && (s = t[i].parentName.trim() + "." + s);
                                var o = '<span class="' + cls + 'jsdoc-param-name">' + s + "</span>";
                                t[i].defaultValue.trim() !== "" && (o += '<span class="' + cls + 'jsdoc-param-defaultValue">=' + t[i].defaultValue + "</span>"), t[i].optional && (o = '<span class="' + cls + 'jsdoc-param-optionalWrapper">' + '<span class="' + cls + 'farg-optionalBracket">[</span>' + o + '<span class="' + cls + 'jsdoc-param-optionalBracket">]</span>' + "</span>"), r += o
                            }
                            r += t[i].description.trim() === "" ? "" : ' - <span class="' + cls + 'jsdoc-param-description">' + t[i].description + "</span>", r += "</div>"
                        }
                        return r !== "" && (e = '<span class="' + cls + 'jsdoc-param-wrapper">' + r + "</span>" + e), n + e
                    },
                    C = function(e) {
                        try {
                            e = " " + e + " ";
                            var t = / ?@\w{1,50}\s ?/gi,
                                n;
                            while ((n = t.exec(e)) !== null) n.index === t.lastIndex && t.lastIndex++, e = e.replace(n[0], ' <span class="' + cls + 'jsdoc-tag">' + n[0].trim() + "</span> ")
                        } catch (r) {
                            showError(ts, editor, r)
                        }
                        return e.trim()
                    },
                    k = function(e) {
                        e = " " + e + " ";
                        try {
                            var t = /\s{[^}]{1,50}}\s/g,
                                n;
                            while ((n = t.exec(e)) !== null) n.index === t.lastIndex && t.lastIndex++, e = e.replace(n[0], ' <span class="' + cls + 'type">' + n[0].trim() + "</span> ")
                        } catch (r) {
                            showError(ts, editor, r)
                        }
                        return e.trim()
                    },
                    L = function(e) {
                        try {
                            var t = "HTTP_PROTO_PLACEHOLDER",
                                n = "HTTPS_PROTO_PLACEHOLDER",
                                r = /\bhttps?:\/\/[^\s<>"`{}|\^\[\]\\]+/gi,
                                i;
                            while ((i = r.exec(e)) !== null) {
                                i.index === r.lastIndex && r.lastIndex++;
                                var s = i[0].replace(/https/i, n).replace(/http/i, t),
                                    o = i[0].replace(new RegExp("https://", "i"), "").replace(new RegExp("http://", "i"), "");
                                e = e.replace(i[0], '<a class="' + cls + 'tooltip-link" href="' + s + '" target="_blank">' + o + " </a>")
                            }
                            e = e.replace(new RegExp(n, "gi"), "https").replace(new RegExp(t, "gi"), "http")
                        } catch (u) {
                            showError(ts, editor, u)
                        }
                        return e
                    };
                i.substr(0, 1) === "*" && (i = i.substr(1)), i = htmlEncode(i.trim()), i = N(i, s), i = C(i), i = k(i), i = L(i), r.appendChild(elFromString(i))
            }
            if (e.url) {
                r.appendChild(document.createTextNode(" "));
                var A = elt("a", null, "[docs]");
                A.target = "_blank", A.href = e.url, r.appendChild(A)
            }
            e.origin && !1 && r.appendChild(elt("div", null, elt("em", null, "source: " + e.origin)))
        }
        return r
    }

    function parseJsDocParams(e) {
        if (!e) return [];
		
        e = e.replace(/@param/gi, "@param");
        var t = [];
        while (e.indexOf("@param") !== -1) {
            e = e.substring(e.indexOf("@param") + 6);
            var n = e.indexOf("@"),
                r = n === -1 ? e : e.substr(0, n),
                i = {
                    name: "",
                    parentName: "",
                    type: "",
                    description: "",
                    optional: !1,
                    defaultValue: ""
                },
                s = /\s{[^}]{1,50}}\s/,
                o;
            while ((o = s.exec(r)) !== null) o.index === s.lastIndex && s.lastIndex++, i.type = o[0], r = r.replace(i.type, "").trim(), i.type = i.type.replace("{", "").replace("}", "").replace(" ", "").trim();
            r = r.trim();
            if (r.substr(0, 1) === "[") {
                i.optional = !0;
                var u = r.indexOf("]");
                if (u === -1) {
                    showError("failed to parse parameter name; Found starting '[' but missing closing ']'");
                    continue
                }
                var a = r.substring(0, u + 1);
                r = r.replace(a, "").trim(), a = a.replace("[", "").replace("]", "");
                if (a.indexOf("=") !== -1) {
                    var f = a.substr(a.indexOf("=") + 1);
                    f.trim() === "" ? i.defaultValue = "undefined" : i.defaultValue = f.trim(), i.name = a.substring(0, a.indexOf("=")).trim()
                } else i.name = a.trim()
            } else {
                var l = r.indexOf(" ");
                l !== -1 ? (i.name = r.substr(0, l), r = r.substr(l).trim()) : (i.name = r, r = "")
            }
            var c = i.name.indexOf(".");
            c !== -1 && (i.parentName = i.name.substring(0, c), i.name = i.name.substring(c + 1)), r = r.trim(), r.length > 0 && (i.description = r.replace("-", "").trim()), i.name = htmlEncode(i.name), i.parentName = htmlEncode(i.parentName), i.description = htmlEncode(i.description), i.type = htmlEncode(i.type), i.defaultValue = htmlEncode(i.defaultValue), t.push(i)
        }
        return t
    }

    function findRefs(e, t, n) {
        if (!inJavascriptMode(t)) return;
        e.request(t, {
            type: "refs",
            fullDocs: !0
        }, function(r, i) {
            if (r) return showError(e, t, r);
            if (typeof n == "function") {
                n(i);
                return
            }
            closeAllTips();
            var s = document.createElement("div"),
                o = document.createElement("span");
            o.textContent = i.name + "(" + i.type + ")", o.setAttribute("style", "font-weight:bold;"), s.appendChild(o);
            var u = makeTooltip(null, null, s, t, !1, -1);
            if (!i.refs || i.refs.length === 0) {
                u.appendChild(elt("div", "", "No References Found"));
                return
            }
            var a = document.createElement("div");
            a.setAttribute("style", "font-style:italic; margin-bottom:3px; cursor:help"), a.innerHTML = i.refs.length + " References Found", a.setAttribute("title", "Use up and down arrow keys to navigate between references. \n\nPress Esc while focused on the list to close the popup (or use the close button in the top right corner).\n\n This is not guaranteed to find references in other files or references for non-private variables."), s.appendChild(a);
            var f = document.createElement("select");
            f.setAttribute("multiple", "multiple"), f.addEventListener("change", function() {
                var n = findDoc(e, t),
                    r = this,
                    i;
                for (var s = 0; s < r.options.length; s++) {
                    if (i) {
                        r[s].selected = !1;
                        continue
                    }
                    r[s].selected && (i = r[s], i.style.color = "grey")
                }
                var o = i.getAttribute("data-file"),
                    a = {
                        line: i.getAttribute("data-line"),
                        ch: i.getAttribute("data-ch")
                    },
                    f = 300,
                    l = {
                        name: o
                    };
                n.name == o && (l = n, f = 50);
                var c = t.getAnimatedScroll();
                c && t.setAnimatedScroll(!1), moveTo(e, n, l, a, null, !0), setTimeout(function() {
                    moveTooltip(u, null, null, t), closeAllTips(u), c && t.setAnimatedScroll(!0)
                }, f)
            });
            var l = function(e, t) {
                    var n = document.createElement("option");
                    n.setAttribute("data-file", e), n.setAttribute("data-line", t.line), n.setAttribute("data-ch", t.ch), n.text = t.line + 1 + ":" + t.ch + " - " + e, f.appendChild(n)
                },
                c = function() {
                    var e = f.options.length * 15;
                    e = e > 175 ? 175 : e, f.style.height = e + "px", u.appendChild(f), f.focus(), f.addEventListener("keydown", function(e) {
                        e && e.keyCode && e.keyCode == 27 && remove(u)
                    })
                };
            for (var h = 0; h < i.refs.length; h++) {
                var p = i.refs[h];
                try {
                    l(p.file, p.start), h === i.refs.length - 1 && c()
                } catch (d) {
                    console.log("findRefs inner loop error (should not happen)", d)
                }
            }
        })
    }

    function rename(e, t) {
        findRefs(e, t, function(n) {
            if (!n || n.refs.length === 0) {
                showError(e, t, "Cannot rename as no references were found for this variable");
                return
            }
            var r = function(r) {
                    e.request(t, {
                        type: "rename",
                        newName: r,
                        fullDocs: !0
                    }, function(r, i) {
                        if (r) return showError(e, t, r);
                        applyChanges(e, i.changes, function(e) {
                            var r = makeTooltip(null, null, elt("div", "", "Replaced " + e.replaced + " references sucessfully"), t, !0),
                                i = elt("div", "");
                            i.setAttribute("style", "color:red"), e.replaced != n.refs.length && (i.textContent = " WARNING! original refs: " + n.refs.length + ", replaced refs: " + e.replaced), e.errors !== "" && (i.textContent += " \n Errors encountered:" + e.errors), i.textContent !== "" && r.appendChild(i)
                        })
                    })
                },
                i = makeTooltip(null, null, elt("div", "", n.name + ": " + n.refs.length + " references found \n (WARNING: this wont work for refs in another file!) \n\n Enter new name:\n"), t, !0),
                s = elt("input");
            i.appendChild(s);
            try {
                setTimeout(function() {
                    s.focus()
                }, 100)
            } catch (o) {}
            var u = elt("button", "");
            u.textContent = "Rename", u.setAttribute("type", "button"), u.addEventListener("click", function() {
                remove(i);
                var n = s.value;
                if (!n || n.trim().length === 0) {
                    showError(e, t, "new name cannot be empty");
                    return
                }
                r(n)
            }), i.appendChild(u)
        })
    }

    function applyChanges(e, t, n) {
        var r = ace.require("ace/range").Range,
            i = Object.create(null);
        for (var s = 0; s < t.length; ++s) {
            var o = t[s];
            (i[o.file] || (i[o.file] = [])).push(o)
        }
        var u = {
            replaced: 0,
            status: "",
            errors: ""
        };
        for (var a in i) {
            var f = e.docs[a],
                l = i[a];
            if (!f) continue;
            l.sort(function(e, t) {
                return cmpPos(t.start, e.start)
            });
            var c = "*rename" + ++nextChangeOrig;
            for (var s = 0; s < l.length; ++s) try {
                var o = l[s];
                o.start = toAceLoc(o.start), o.end = toAceLoc(o.end), f.doc.replace(new r(o.start.row, o.start.column, o.end.row, o.end.column), o.text), u.replaced++
            } catch (h) {
                u.errors += "\n " + a + " - " + h.toString(), console.log("error applying rename changes", h)
            }
        }
        typeof n == "function" && n(u)
    }

    function isOnFunctionCall(e) {
        if (!inJavascriptMode(e)) return !1;
        if (somethingIsSelected(e)) return !1;
        if (isInCall(e)) return !1;
        var t = getCurrentToken(e);
        if (!t) return;
        if (!t.start) return;
        if (t.type.indexOf("entity.name.function") !== -1) return !1;
        if (t.type.indexOf("storage.type") !== -1) return !1;
        var n = e.session.getTokenAt(e.getSelectionRange().end.row, t.start + t.value.length + 1);
        return !n || n.value !== "(" ? !1 : !0
    }

    function somethingIsSelected(e) {
        return e.getSession().getTextRange(e.getSelectionRange()) !== ""
    }

    function getCusorPosForTooltip(e) {
        var t = e.renderer.$cursorLayer.getPixelPosition();
        return t.top = e.renderer.$cursorLayer.cursors[0].offsetTop, t.top += e.renderer.scroller.getBoundingClientRect().top, t.left += e.renderer.container.offsetLeft, {
            left: t.left + 45,
            top: t.top + 17
        }
    }

    function getCurrentToken(e) {
        try {
            var t = e.getSelectionRange().end;
            return e.session.getTokenAt(t.row, t.column)
        } catch (n) {
            showError(ts, e, n)
        }
    }

    function getCallPos(e, t) {
        if (somethingIsSelected(e)) return;
        if (!inJavascriptMode(e)) return;
        var n = {},
            r = t || e.getSelectionRange().start;
        r = toAceLoc(r);
        var i = r.row,
            s = r.column,
            o = Math.max(0, i - 6),
            u = "",
            a = 0,
            f = [];
        for (var l = i; l >= o; l--) {
            var c = e.session.getLine(l);
            l === i && (c = c.substr(0, s));
            for (var h = c.length; h >= 0; h--) {
                u = c.substr(h, 1);
                if (u === "}" || u === ")" || u === "]") a += 1;
                else if (u === "{" || u === "(" || u === "[") {
                    if (!(a > 0)) {
                        if (u === "(") {
                            var p = !1,
                                d = c.substr(0, h);
                            if (!d.length) {
                                p && console.log("not fn call because before parent is empty");
                                break
                            }
                            if (d.substr(d.length - 1) === " ") {
                                p && console.log("not fn call because there is a space before paren");
                                break
                            }
                            var v = d.split(" ").reverse()[1];
                            if (v && v.toLowerCase() === "function") {
                                p && console.log("not fn call because this is a function declaration");
                                break
                            }
                            var m = e.session.getTokenAt(l, h);
                            if (m)
                                if (m.type.toString().indexOf("comment") !== -1 || m.type === "keyword" || m.type === "storage.type") {
                                    p && console.log("existing because token is comment, keyword, or storage.type (`function`)");
                                    break
                                }
                            p && console.info("getting arg hints!"), n = {
                                line: l,
                                ch: h
                            };
                            break
                        }
                        break
                    }
                    a -= 1
                } else u === "," && a === 0 && f.push({
                    line: l,
                    ch: h
                })
            }
        }
        if (!n.hasOwnProperty("line")) return;
        var g = 0;
        for (var y = 0; y < f.length; y++) {
            var b = f[y];
            if (b.line === n.line && b.ch > n.ch || b.line > n.line) g += 1
        }
        return {
            start: toTernLoc(n),
            argpos: g
        }
    }

    function isInCall(e, t) {
        var n = getCallPos(e, t);
        return n ? !0 : !1
    }

    function updateArgHints(e, t) {
        function o() {
            e.request(t, {
                type: "type",
                preferFunction: !0,
                end: r
            }, function(n, s) {
                if (n && n.toString().toLowerCase().indexOf("no expression at") === -1 && n.toString().toLowerCase().indexOf("no type found at") === -1) return showError(e, t, n);
                if (n || !s.type || !/^fn\(/.test(s.type)) return;
                e.cachedArgHints = {
                    start: r,
                    type: parseFnType(s.type),
                    name: s.exprName || s.name || "fn",
                    guess: s.guess,
                    doc: t,
                    comments: s.doc
                }, showArgHints(e, t, i)
            })
        }
        clearTimeout(debounce_updateArgHints), closeArgHints(e);
        var n = getCallPos(t);
        if (!n) {
            debounce_updateArgHints = setTimeout(function() {
                showType(e, t)
            }, 500);
            return
        }
        var r = n.start,
            i = n.argpos,
            s = e.cachedArgHints;
        if (s && s.session == t && cmpPos(r, s.start) === 0) return showArgHints(e, t, i);
        debounce_updateArgHints = setTimeout(o, 500)
    }

    function showArgHints(e, t, n) {
        closeArgHints(e);
        var r = e.cachedArgHints,
            i = r.type,
            s = r.comments;
        if (!r.hasOwnProperty("params"))
            if (!r.comments) r.params = null;
            else {
                var o = parseJsDocParams(r.comments);
                !o || o.length === 0 ? r.params = null : r.params = o
            }
        var u = getCusorPosForTooltip(t),
            a = {
                name: r.name,
                guess: r.guess,
                fnArgs: r.type,
                doc: r.comments,
                params: r.params
            },
            f = createInfoDataTip(a, !0, n);
        e.activeArgHints = makeTooltip(u.left, u.top, f, t, !0);
        return
    }

    function parseFnType(e) {
        function r(t) {
            var r = 0,
                i = n;
            for (;;) {
                var s = e.charAt(n);
                if (t.test(s) && !r) return e.slice(i, n);
                /[{\[\(]/.test(s) ? ++r : /[}\]\)]/.test(s) && --r, ++n
            }
        }
        if (e.substring(0, 2) !== "fn") return null;
        if (e.indexOf("(") === -1) return null;
        var t = [],
            n = 3;
        if (e.charAt(n) != ")")
            for (;;) {
                var i = e.slice(n).match(/^([^, \(\[\{]+): /);
                i && (n += i[0].length, i = i[1]), t.push({
                    name: i,
                    type: r(/[\),]/)
                });
                if (e.charAt(n) == ")") break;
                n += 2
            }
        var s = e.slice(n).match(/^\) -> (.*)$/);
        return {
            args: t,
            rettype: s && s[1]
        }
    }

    function htmlEncode(e) {
        var t = {
            "<": "&lt;",
            ">": "&gt;"
        };
        return String(e).replace(/[<>]/g, function(e) {
            return e ? t[e] : ""
        })
    }

    function cmpPos(e, t) {
        return e = toTernLoc(e), t = toTernLoc(t), e.line - t.line || e.ch - t.ch
    }

    function dialog(e, t, n) {
        alert("need to implment dialog")
    }

    function elFromString(e) {
        var t = document.createDocumentFragment(),
            n = document.createElement("span");
        n.innerHTML = e;
        while (n.firstChild) t.appendChild(n.firstChild);
        return t
    }

    function elt(e, t) {
        var n = document.createElement(e);
        t && (n.className = t);
        for (var r = 2; r < arguments.length; ++r) {
            var i = arguments[r];
            typeof i == "string" && (i = document.createTextNode(i)), n.appendChild(i)
        }
        return n
    }

    function closeAllTips(e) {
        var t = document.querySelectorAll("." + cls + "tooltip");
        if (t.length > 0)
            for (var n = 0; n < t.length; n++) {
                if (e && t[n] == e) continue;
                remove(t[n])
            }
    }

    function tempTooltip(e, t, n) {
        n || (n = 3e3);
        var r = getCusorPosForTooltip(e);
        return makeTooltip(r.left, r.top, t, e, !0, n)
    }

    function makeTooltip(e, t, n, r, i, s) {
        if (e === null || t === null) {
            var o = getCusorPosForTooltip(r);
            e = o.left, t = o.top
        }
        var u = elt("div", cls + "tooltip", n);
        u.style.left = e + "px", u.style.top = t + "px", document.body.appendChild(u);
        
        //alert( n.innerText )
		if( /*n.innerText.indexOf(".")==3*/ n.innerText.substr(0,4)=="app." || n.innerText.substr(0,4)=="MUI." )
		{
			var a = document.createElement("a");
			a.setAttribute("title", "More info"/*DH:"close"*/), a.setAttribute("class", cls + "tooltip-boxclose"), a.addEventListener("mousedown", function() {
				remove(u); ds_gotoHelp( n.innerText ); //DH:
			}), u.appendChild(a);
		}

        if (i === !0) {
            if (!r) throw Error("tern.makeTooltip called with closeOnCursorActivity=true but editor was not passed. Need to pass editor!");
            var f = function() {
                if (!u.parentNode) return;
                remove(u), r.getSession().selection.off("changeCursor", f), r.getSession().off("changeScrollTop", f), r.getSession().off("changeScrollLeft", f)
            };
            r.getSession().selection.on("changeCursor", f), r.getSession().on("changeScrollTop", f), r.getSession().on("changeScrollLeft", f)
        }
        if (s) {
            s = parseInt(s, 10);
            if (s > 100) {
                var l = function() {
                    if (!u.parentNode) return;
                    fadeOut(u, s);
                    try {
                        r.getSession().selection.off("changeCursor", f), r.getSession().off("changeScrollTop", f), r.getSession().off("changeScrollLeft", f)
                    } catch (e) {}
                };
                setTimeout(l, s)
            }
        }
        return u
    }

    function moveTooltip(e, t, n, r) {
        if (t === null || n === null) {
            var i = getCusorPosForTooltip(r);
            t = i.left, n = i.top
        }
        e.style.left = t + "px", e.style.top = n + "px"
    }

    function remove(e) {
        var t = e && e.parentNode;
        t && t.removeChild(e)
    }

    function fadeOut(e, t) {
        t || (t = 1100);
        if (t === -1) {
            remove(e);
            return
        }
        e.style.opacity = "0", setTimeout(function() {
            remove(e)
        }, t)
    }

    function showError(e, t, n, r) {
        return
    }

    function closeArgHints(e) {
        e.activeArgHints && (remove(e.activeArgHints), e.activeArgHints = null)
    }

    function jumpToDef(e, t) {
        function n(n) {
            var r = {
                    type: "definition",
                    variable: n || null
                },
                i = findDoc(e, t);
            e.server.request(buildRequest(e, i, r, null, !0), function(n, r) {
                if (n) return showError(e, t, n);
                if (!r.file && r.url) {
                    window.open(r.url);
                    return
                }
                if (r.file) {
                    var s = e.docs[r.file],
                        o;
                    if (s && (o = findContext(s.session, r))) {
                        e.jumpStack.push({
                            file: i.name,
                            start: toTernLoc(t.getSelectionRange().start),
                            end: toTernLoc(t.getSelectionRange().end)
                        }), moveTo(e, i, s, o.start, o.end);
                        return
                    }
                    moveTo(e, i, {
                        name: r.file
                    }, r.start, r.end);
                    return
                }
                showError(e, t, "Could not find a definition.")
            })
        }
        n()
    }

    function moveTo(e, t, n, r, i, s) {
        i = i || r;
        if (t != n) {
            e.options.switchToDoc ? (s || closeAllTips(), e.options.switchToDoc(n.name, toAceLoc(r), toAceLoc(i))) : showError(e, t.session, "Need to add editor.ternServer.options.switchToDoc to jump to another document");
            return
        }
        var o = toAceLoc(r);
        t.session.gotoLine(o.row, o.column || 0), t.session.unfold(o);
        var u = t.session.getSelection();
        u.setSelectionRange({
            start: toAceLoc(r),
            end: toAceLoc(i)
        })
    }

    function jumpBack(e, t) {
        var n = e.jumpStack.pop(),
            r = n && e.docs[n.file];
        if (!r) return;
        moveTo(e, findDoc(e, t), r, n.start, n.end)
    }

    function findContext(e, t) {
        try {
            var n = t.context.slice(0, t.contextOffset).split("\n"),
                r = t.start.line - (n.length - 1),
                i = null;
            n.length == 1 ? i = t.start.ch : i = e.session.getLine(r).length - n[0].length;
            var s = Pos(r, i),
                o = e.session.getLine(r).slice(s.ch);
            for (var u = r + 1; u < e.session.getLength() && o.length < t.context.length; ++u) o += "\n" + e.session.getLine(u)
        } catch (a) {
            console.log("ext-tern.js findContext Error; (error is caused by a doc (string) being passed to this function instead of editor due to ghetto hack from adding VS refs... need to fix eventually. should only occur when jumping to def in separate file)", a)
        }
        return t;
        var f, l, c
    }

    function atInterestingExpression(e) {
        var t = e.getSelectionRange().end,
            n = e.session.getTokenAt(t.row, t.column);
        return t = toTernLoc(t), n.start < t.ch && (n.type == "comment" || n.type == "string") ? !1 : /\w/.test(e.session.getLine(t.line).slice(Math.max(t.ch - 1, 0), t.ch + 1))
    }

    function sendDoc(e, t) {
        e.server.request({
            files: [{
                type: "full",
                name: t.name,
                text: docValue(e, t)
            }]
        }, function(e) {
            e ? console.error(e) : t.changed = null
        })
    }

    function inJavascriptMode(e) {
        return getCurrentMode(e) == "javascript"
    }

    function getCurrentMode(e) {
        var t = e.session.$mode.$id || "";
        t = t.split("/").pop();
        if (t === "html" || t === "php") {
            t === "php" && (t = "html");
            var n = e.getCursorPosition(),
                r = e.session.getState(n.row);
            typeof r == "object" && (r = r[0]), r.substring && (r.substring(0, 3) == "js-" ? t = "javascript" : r.substring(0, 4) == "css-" ? t = "css" : r.substring(0, 4) == "php-" && (t = "php"))
        }
        return t
    }

    function startsWith(e, t) {
        return e.slice(0, t.length).toUpperCase() == t.toUpperCase()
    }

    function trackChange(e, t, n) {
        var r = {};
        r.from = toTernLoc(n.data.range.start), r.to = toTernLoc(n.data.range.end), n.data.hasOwnProperty("text") ? r.text = [n.data.text] : r.text = n.data.lines;
        var i = findDoc(e, t),
            s = e.cachedArgHints;
        s && s.doc == t && cmpPos(s.start, r.to) <= 0 && (e.cachedArgHints = null);
        var o = i.changed;
        o === null && (i.changed = o = {
            from: r.from.line,
            to: r.from.line
        });
        var u = r.from.line + (r.text.length - 1);
        r.from.line < o.to && (o.to = o.to - (r.to.line - u)), u >= o.to && (o.to = u + 1), o.from > r.from.line && (o.from = o.from.line), t.getLength() > bigDoc && r.to - o.from > 100 && setTimeout(function() {
            i.changed && i.changed.to - i.changed.from > 100 && sendDoc(e, i)
        }, 200)
    }

    function loadExplicitVsRefs(e, t) {
        if (!t.ternServer || !t.ternServer.enabledAtCurrentLocation(t)) return;
        var n = window && window.location && window.location.toString().toLowerCase().indexOf("http") === 0,
            r = "";
        for (var i = 0; i < t.session.getLength(); i++) {
            var s = t.session.getLine(i);
            if (s.substr(0, 3) !== "///") break;
            r += "\n" + s
        }
        if (r === "") return;
        var o = /(?!\/\/\/\s*?<reference path=")[^"]*/g,
            u, a = [];
        while ((u = o.exec(r)) != null) {
            u.index === o.lastIndex && o.lastIndex++;
            var f = u[0].replace('"', "");
            f.toLowerCase().indexOf("reference path") === -1 && f.trim() !== "" && f.toLowerCase().indexOf("/>") === -1 && f.toLowerCase().indexOf("vsdoc") === -1 && a.push(f)
        }
        var l = document.createElement("span"),
            c = 0,
            h = 0,
            p = function(e, n) {
                h++;
                var r = document.createElement("div");
                r.setAttribute("style", "font-size:smaller; font-style:italic; color:" + (n ? "red" : "gray")), r.textContent = e, l.appendChild(r), c == h && tempTooltip(t, l)
            },
            d = function(r) {
                try {
                    var i = r.toLowerCase().indexOf("http") === 0;
                    if (i || n) {
                        c++;
                        var s = new XMLHttpRequest;
                        s.open("get", r, !0), s.send(), s.onreadystatechange = function() {
                            s.readyState == 4 && (s.status == 200 ? (console.log("adding web reference: " + r), p("adding web reference: " + r), t.ternServer.addDoc(r, s.responseText)) : s.status == 404 ? (console.log("error adding web reference (not found): " + r, s), p("error adding web reference (not found): " + r, !0)) : (console.log("error adding web reference (unknown error, see xhr): " + r, s), p("error adding web reference (unknown error, see console): " + r, !0)))
                        }
                    } else c++, resolveFilePath(e, r, function(t) {
                        getFile(e, t, function(n, r) {
                            n || !r ? (console.log("error getting file: " + t, n), p("error getting file: " + t + "(see console for details)", !0)) : (e.addDoc(t, r.toString()), console.log("adding reference: " + t), p("adding reference: " + t))
                        })
                    })
                } catch (o) {
                    throw console.log("add to tern error; path=" + r), o
                }
            };
        for (var i = 0; i < a.length; i++) {
            var v = a[i];
            d(v)
        }
    }

    function WorkerServer(e, t) {
        function o(e, t) {
            t && (e.id = ++i, s[i] = t), n.postMessage(e)
        }
        var n = t ? new t : new Worker(e.options.workerScript),
            r = function(e) {
                n.postMessage({
                    type: "init",
                    defs: e.options.defs,
                    plugins: e.options.plugins,
                    scripts: e.options.workerDeps
                })
            };
        r(e);
        var i = 0,
            s = {};
        n.onmessage = function(t) {
            var n = t.data;
            n.type == "getFile" ? getFile(e, n.name, function(e, t) {
                o({
                    type: "getFile",
                    err: String(e),
                    text: t,
                    id: n.id
                })
            }) : n.type == "debug" ? console.log("(worker debug) ", n.message) : n.id && s[n.id] && (s[n.id](n.err, n.body), delete s[n.id])
        }, n.onerror = function(e) {
            for (var t in s) s[t](e);
            s = {}
        }, this.addFile = function(e, t) {
            o({
                type: "add",
                name: e,
                text: t
            })
        }, this.delFile = function(e) {
            o({
                type: "del",
                name: e
            })
        }, this.request = function(e, t) {
            o({
                type: "req",
                body: e
            }, t)
        }, this.setDefs = function(e) {
            o({
                type: "setDefs",
                defs: e
            })
        }, this.restart = function(e) {
            r(e)
        }, this.sendDebug = function(e) {
            o({
                type: "debug",
                body: e
            })
        }
    }
    var TernServer = function(options) {
            var self = this;
            this.options = options || {};
            var plugins = this.options.plugins || (this.options.plugins = {});
            plugins.hasOwnProperty("doc_comment") || (plugins.doc_comment = {}), plugins.doc_comment.hasOwnProperty("fullDocs") || (plugins.doc_comment.fullDocs = !0), this.options.hasOwnProperty("switchToDoc") || (this.options.switchToDoc = function(e, t) {
                console.log("tern.switchToDoc called but not defined (need to specify this in options to enable jumpting between documents). name=" + e + "; start=", t)
            }), this.options.hasOwnProperty("defs") || (this.options.defs = ["browser", "ecma5"]), this.options.hasOwnProperty("useWorker") || (this.options.useWorker = !0);
            if (this.options.useWorker) this.server = new WorkerServer(this, this.options.workerClass);
            else {
                if (this.options.defs && this.options.defs.length > 0) {
                    var tmp = [];
                    for (var i = 0; i < this.options.defs.length; i++) tmp.push(eval("def_" + this.options.defs[i]));
                    this.options.defs = tmp
                }
                this.server = new tern.Server({
                    getFile: function(e, t) {
                        return getFile(self, e, t)
                    },
                    async: !0,
                    defs: this.options.defs,
                    plugins: this.options.plugins
                })
            }
            this.docs = Object.create(null), this.trackChange = function(e, t) {
                trackChange(self, t, e)
            }, this.cachedArgHints = null, this.activeArgHints = null, this.jumpStack = [], this.aceTextCompletor = null, this.lastAutoCompleteFireTime = null, this.queryTimeout = 3e3, this.options.queryTimeout && !isNaN(parseInt(this.options.queryTimeout)) && (this.queryTimeout = parseInt(this.options.queryTimeout))
        },
        Pos = function(e, t) {
            return {
                line: e,
                ch: t
            }
        },
        cls = "Ace-Tern-",
        bigDoc = 250,
        aceCommands = {
            ternJumpToDef: {
                name: "ternJumpToDef",
                exec: function(e) {
                    e.ternServer.jumpToDef(e)
                },
                bindKey: "Alt-."
            },
            ternJumpBack: {
                name: "ternJumpBack",
                exec: function(e) {
                    e.ternServer.jumpBack(e)
                },
                bindKey: "Alt-,"
            },
            ternShowType: {
                name: "ternShowType",
                exec: function(e) {
                    e.ternServer.showType(e)
                },
                bindKey: "Ctrl-I"
            },
            ternFindRefs: {
                name: "ternFindRefs",
                exec: function(e) {
                    e.ternServer.findRefs(e)
                },
                bindKey: "Ctrl-E"
            },
            ternRename: {
                name: "ternRename",
                exec: function(e) {
                    e.ternServer.rename(e)
                },
                bindKey: "Ctrl-Shift-E"
            },
            ternRefresh: {
                name: "ternRefresh",
                exec: function(e) {
                    var t = !1;
                    e.ternServer.refreshDocLastCalled != null && (new Date).getTime() - e.ternServer.refreshDocLastCalled < 1e3 && (t = !0), e.ternServer.refreshDocLastCalled = (new Date).getTime(), e.ternServer.refreshDoc(e, t)
                },
                bindKey: "Alt-R"
            }
        },
        debugCompletions = !1;
    TernServer.prototype = {
        bindAceKeys: function(e) {
            for (var t in aceCommands) {
                var n = aceCommands[t];
                e.commands.addCommand(n)
            }
        },
        addDoc: function(e, t) {
            var n = {
                    session: t,
                    name: e,
                    changed: null
                },
                r = "";
            return t.constructor.name === "String" ? r = t : (r = docValue(this, n), t.on("change", this.trackChange)), this.server.addFile(e, r), this.docs[e] = n
        },
        delDoc: function(e) {
            var t = this.docs[e];
            if (!t) return;
            try {
                t.session.off("change", this.trackChange)
            } catch (n) {}
            delete this.docs[e], this.server.delFile(e)
        },
        hideDoc: function(e) {
            closeAllTips();
            var t = this.docs[e];
            t && t.changed && sendDoc(this, t)
        },
        refreshDoc: function(e, t) {
            var n = function(e) {
                console.log(e)
            };
            if (t) {
                this.docChanged(e), n("Tern fully refreshed (reloaded current doc and all refs)");
                return
            }
            var r = findDoc(this, e);
            sendDoc(this, r), n('Tern document refreshed <div style="color:gray; font-size:smaller;">(press hotkey twice in  &lt; 1 second to do a full reload including refs)</div>')
        },
        getCompletions: function(e, t, n, r, i) {
            getCompletions(this, e, t, n, r, i)
        },
        showType: function(e, t, n) {
            showType(this, e, t, n)
        },
        updateArgHints: function(e) {
            updateArgHints(this, e)
        },
        jumpToDef: function(e) {
            jumpToDef(this, e)
        },
        jumpBack: function(e) {
            jumpBack(this, e)
        },
        rename: function(e) {
            rename(this, e)
        },
        findRefs: function(e) {
            findRefs(this, e)
        },
        request: function(e, t, n, r, i) {
            var s = this,
                o = findDoc(this, e),
                u = buildRequest(this, o, t, r, i);
            this.server.request(u, function(e, r) {
                !e && s.options.responseFilter && (r = s.options.responseFilter(o, t, u, e, r)), n(e, r)
            })
        },
        enabledAtCurrentLocation: function(e) {
            return inJavascriptMode(e)
        },
        getCallPos: function(e, t) {
            return getCallPos(e, t)
        },
        docChanged: function(e) {
            var t = this;
            for (var n in this.docs) this.delDoc(n);
            var r = function(n) {
                t.addDoc(n, e), loadExplicitVsRefs(t, e)
            };
            this.options.getCurrentFileName ? this.options.getCurrentFileName(r) : r("current")
        },
        restart: function() {
            if (!this.options.useWorker) return;
            this.server.restart(this)
        },
        debug: function(e) {
            if (!e) {
                console.log("debug commands: files, filecontents");
                return
            }
            if (!this.options.useWorker) return;
            this.server.sendDebug(e)
        },
        debugCompletions: function(e) {
            e ? debugCompletions = !0 : debugCompletions = !1
        },
        closeAllTips: function() {
            closeAllTips()
        }
    }, exports.TernServer = TernServer;
    var popupSelectBound = !1,
        nextChangeOrig = 0,
        debounce_updateArgHints = null,
        dom = require("ace/lib/dom");
    dom.importCssString(".Ace-Tern-tooltip { border: 1px solid silver; border-radius: 3px; color: #444; padding: 2px 5px; padding-right:35px; font-size: 90%; font-family: monospace; background-color: white; white-space: pre-wrap; max-width: 50em; max-height:30em; overflow-y:auto; position: absolute; z-index: 10; -webkit-box-shadow: 2px 3px 5px rgba(0, 0, 0, .2); -moz-box-shadow: 2px 3px 5px rgba(0, 0, 0, .2); box-shadow: 2px 3px 5px rgba(0, 0, 0, .2); transition: opacity 1s; -moz-transition: opacity 1s; -webkit-transition: opacity 1s; -o-transition: opacity 1s; -ms-transition: opacity 1s; } .Ace-Tern-tooltip-boxclose { position:absolute; top:0; right:3px; color:green; } .Ace-Tern-tooltip-boxclose:hover { background-color:yellow; } .Ace-Tern-tooltip-boxclose:before { content:'...'; cursor:pointer; font-weight:bold; font-size:larger; } .Ace-Tern-completion { padding-left: 12px; position: relative; } .Ace-Tern-completion:before { position: absolute; left: 0; bottom: 0; border-radius: 50%; font-weight: bold; height: 13px; width: 13px; font-size:11px; line-height: 14px; text-align: center; color: white; -moz-box-sizing: border-box; -webkit-box-sizing: border-box; box-sizing: border-box; } .Ace-Tern-completion-unknown:before { content:'?'; background: #4bb; } .Ace-Tern-completion-object:before { content:'O'; background: #77c; } .Ace-Tern-completion-fn:before { content:'F'; background: #7c7; } .Ace-Tern-completion-array:before { content:'A'; background: #c66; } .Ace-Tern-completion-number:before { content:'1'; background: #999; } .Ace-Tern-completion-string:before { content:'S'; background: #999; } .Ace-Tern-completion-bool:before { content:'B'; background: #999; } .Ace-Tern-completion-guess { color: #999; } .Ace-Tern-hint-doc { max-width: 35em; } .Ace-Tern-fhint-guess { opacity: .7; } .Ace-Tern-fname { color: black; } .Ace-Tern-farg { color: #70a; } .Ace-Tern-farg-current { color: #70a; font-weight:bold; font-size:larger; text-decoration:underline; } .Ace-Tern-farg-current-description { font-style:italic; margin-top:2px; color:black; } .Ace-Tern-farg-current-name { font-weight:bold; } .Ace-Tern-type { color: #07c; font-size:smaller; } .Ace-Tern-jsdoc-tag { color: #B93A38; text-transform: lowercase; font-size:smaller; font-weight:600; } .Ace-Tern-jsdoc-param-wrapper{ /*background-color: #FFFFE3; padding:3px;*/ } .Ace-Tern-jsdoc-tag-param-child{ display:inline-block; width:0px; } .Ace-Tern-jsdoc-param-optionalWrapper { font-style:italic; } .Ace-Tern-jsdoc-param-optionalBracket { color:grey; font-weight:bold; } .Ace-Tern-jsdoc-param-name { color: #70a; font-weight:bold; } .Ace-Tern-jsdoc-param-defaultValue { color:grey; } .Ace-Tern-jsdoc-param-description { color:black; } .Ace-Tern-typeHeader-simple{ font-size:smaller; font-weight:bold; display:block; font-style:italic; margin-bottom:3px; color:grey; } .Ace-Tern-typeHeader{ display:block; font-style:italic; margin-bottom:3px; } .Ace-Tern-tooltip-link{font-size:smaller; color:blue;} .ace_autocomplete {width: 400px !important;}", "ace_tern")
}), define("ace/tern/tern", ["require", "exports", "module", "ace/config", "ace/snippets", "ace/autocomplete/text_completer", "ace/autocomplete", "ace/tern/tern_server", "ace/editor"], function(e, t, n) {
    "use strict";

    function h(e) {
        var t = e.getCursorPosition(),
            n = e.session.getLine(t.row),
            r;
        return e.completers.forEach(function(e) {
            e.identifierRegexps && e.identifierRegexps.forEach(function(e) {
                !r && e && (r = util.retrievePrecedingIdentifier(n, t.column, e))
            })
        }), r || util.retrievePrecedingIdentifier(n, t.column)
    }
    var r = e("../config"),
        i = e("../snippets").snippetManager,
        s = {
            getCompletions: function(e, t, n, r, s) {
                var o = i.snippetMap,
                    u = [];
                i.getActiveScopes(e).forEach(function(e) {
                    var t = o[e] || [];
                    for (var n = t.length; n--;) {
                        var r = t[n],
                            i = r.name || r.tabTrigger;
                        if (!i) continue;
                        u.push({
                            caption: i,
                            snippet: r.content,
                            meta: r.tabTrigger && !r.name ? r.tabTrigger + "\u21e5 " : "snippet"
                        })
                    }
                }, this), s(null, u)
            }
        },
        o = e("../autocomplete/text_completer"),
        u = {
            getCompletions: function(e, t, n, r, i) {
                var s = e.session.getState(n.row),
                    o = t.$mode.getCompletions(s, t, n, r);
                i(null, o)
            }
        },
        a = [s, o, u];
    t.setCompleters = function(e) {
        a = e || []
    }, t.addCompleter = function(e) {
        a.push(e)
    };
    var f = {
            name: "expandSnippet",
            exec: function(e) {
                var t = i.expandWithTab(e);
                t || e.execCommand("indent")
            },
            bindKey: "tab"
        },
        l = function(e) {
            var t = e.$id;
            i.files || (i.files = {}), c(t);
            if (e.$modes)
                for (var n in e.$modes) l(e.$modes[n])
        },
        c = function(e) {
            if (!e || i.files[e]) return;
            var t = e.replace("mode", "snippets");
            i.files[e] = {}, r.loadModule(t, function(t) {
                t && (i.files[e] = t, !t.snippets && t.snippetText && (t.snippets = i.parseSnippetFile(t.snippetText)), i.register(t.snippets || [], t.scope), t.includeScopes && (i.snippetMap[t.scope].includeScopes = t.includeScopes, t.includeScopes.forEach(function(e) {
                    c("ace/mode/" + e)
                })))
            })
        },
        p = function(e) {
            var t = e.editor,
                n = e.args || "",
                r = t.completer && t.completer.activated;
            if (e.command.name === "backspace") r && !h(t) && t.completer.detach();
            else if (e.command.name === "insertstring") {
                var i = h(t);
                i && !r && (t.completer || (t.completer = new d), t.completer.autoInsert = !1, t.completer.showPopup(t))
            }
        },
        d = e("../autocomplete").Autocomplete;
    d.startCommand = {
        name: "startAutocomplete",
        exec: function(e, t) {
            e.completer || (e.completer = new d), e.completers = [], e.$enableSnippets && e.completers.push(s), e.ternServer && e.$enableTern ? e.ternServer.enabledAtCurrentLocation(e) ? (e.completers.push(e.ternServer), e.ternServer.aceTextCompletor = o) : e.$enableBasicAutocompletion && e.completers.push(o, u) : e.$enableBasicAutocompletion && e.completers.push(o, u), e.completer.showPopup(e), e.completer.cancelContextMenu()
        },
        bindKey: "Ctrl-Space|Ctrl-Shift-Space|Alt-Space"
    };
    var v = function(e, t) {
            l(t.session.$mode)
        },
        m = {},
        g = e("./tern_server").TernServer,
        y, b = function(e) {
            function s() {
                m.workerScript || (m.workerScript = t), y = new g(m), e()
            }
            var t = m.workerScript || r.moduleUrl("worker/tern");
            if (m.useWorker === !1) {
                var n = "ace_tern_files";
                if (document.getElementById(n)) s();
                else {
                    var i = document.createElement("script");
                    i.setAttribute("id", n), document.head.appendChild(i), i.onload = s, i.setAttribute("src", t)
                }
            } else s()
        },
        w = null,
        E, S = function(e, t) {
            clearTimeout(E), E = setTimeout(function() {
                w.ternServer.updateArgHints(w)
            }, 10)
        },
        x = function(e, t) {
            if (e.command.name === "insertstring" && e.args === "." && e.editor.ternServer && e.editor.ternServer.enabledAtCurrentLocation(e.editor)) {
                var n = e.editor.getSelectionRange().end,
                    r = e.editor.session.getTokenAt(n.row, n.column);
                if (r && r.type !== "string" && r.type.toString().indexOf("comment") === -1) {
                    try {
                        e.editor.ternServer.lastAutoCompleteFireTime = null
                    } catch (i) {}
                    e.editor.execCommand("startAutocomplete")
                }
            }
        };
    a.push(y), t.server = y;
    var T = e("../editor").Editor;
    r.defineOptions(T.prototype, "editor", {
        enableTern: {
            set: function(e) {
                var t = this;
                typeof e == "object" && (m = e, e = !0), e ? (w = t, b(function() {
                    t.completers = a, t.ternServer = y, t.commands.addCommand(d.startCommand), t.getSession().selection.on("changeCursor", S), t.commands.on("afterExec", x), m.startedCb && m.startedCb()
                })) : (delete t.ternServer, t.getSession().selection.off("changeCursor", S), t.commands.off("afterExec", x), t.enableBasicAutocompletion || t.commands.removeCommand(d.startCommand))
            },
            value: !1
        },
        enableBasicAutocompletion: {
            set: function(e) {
                e ? (this.completers = a, this.commands.addCommand(d.startCommand)) : this.$enableTern || this.commands.removeCommand(d.startCommand)
            },
            value: !1
        },
        enableSnippets: {
            set: function(e) {
                e ? (this.commands.addCommand(f), this.on("changeMode", v), v(null, this)) : (this.commands.removeCommand(f), this.off("changeMode", v))
            },
            value: !1
        }
    })
});
(function() {
    window.require(["ace/tern/tern"], function() {});
})();
