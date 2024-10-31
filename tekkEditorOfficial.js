ui.script("./config.module.js");
cfg.Portrait
class Main extends App{
    onStart(){
  
 
        this.layMain = ui.addLayout( "main", "linear", "fillxy,vcenter" )

        this.txt = ui.addText( this.layMain, "My Hybrid app")

        this.btn = ui.addButton( this.layMain, "My Button", "primary" )
        this.btn.setOnTouch( ()=>{ app.Vibrate( "0,100,30,100" ); } )
        
        this.editor = new Editor(this.layMain, 0.90, 0.80);

    }
}


class Editor{
    #_CACHE = new Map();
    constructor(layout, width, height){
        this.self = this;
        this.loaded = false;
        this.lay = layout;
        this.width = width;
        this.height = height;
        this.AceEditor = null;
        this.lays = {base: null};
        this._languageModes = _config_.getLanguageModes;
        this.config_keys_array = Object.keys(_config_.init_options);
        this._Mode = (function(self){
            if (self.#_CACHE.has("mode")) return self.#_CACHE.get("mode")
            else{
                let m = app.LoadText("mode", "javascript");
                self.#_CACHE.set("mode", m);
            }
            return self.#_CACHE.get("mode");
        })(this.self);
  
        this._options_List = (function(self){
            if(self.#_CACHE.has("options")) return self.#_CACHE.get("options");
            else{
                if(app.FileExists("AceEditor/config.json") ){
                    self.#_CACHE.set("options",app.ReadFile("AceEditor/config.json"));
                        return self.#_CACHE.get("options");
                }
                else{
                    let file = app.WriteFile("./AceEditor/config.json", JSON.stringify(_config_.init_options));
                        if(!app.ReadFile("./AceEditor/config.json")) app.Error("Failed to intitalise Ace Editor configuration", 0,"./TekkEditor.js", true);
                            self.#_CACHE.set("options",JSON.stringify(_config_.init_options));
                            return self.#_CACHE.get("options");
                }// inner else---end
            }// outer else--end
        })(this.self);//this._config--end
            
            this._createEditor();
    }// constructor
    get Mode(){
        return this._Mode;
    }
    set Mode(x){

    }
    updateEditorOption(opt){
        let optObject = JSON.parse(this._config);
        let {name, value, callback} = opt;
            
    }
    
    _createEditor(){
    
        if(!this.lays.base){
            let base = this.lays.base = ui.addLayout(this.lay, "Linear","Top", this.width, this.height );
            this.lays.buttonBar = {};
            let bbar = this.lays.buttonBar = ui.addLayout(base, "Linear", "Left,FillX", -1, 0.08);

            let selector = bbar.modeSelector = ui.addSelect(bbar, "Select Mode", "Outline, Left", -1, -1);
            selector.list = this._languageModes;
            selector.label = "Language :"

            selector.setOnTouch();

            let webview = this.lays.web_View = ui.addWebView(base, "./AceEditor.html", "FillXY");
            webview.data.self = this;
            webview.setOnLoad(this._editorOnLoad);
        
            base.border = "24px";
            base.padding = [0,0.02,0,0];
            base.cornerRadius = [10,10,10,10];
            base.backColor = "white";
            base.el.style.boxShadow = "0 0px 20px 0 rgba(0,0,0,0.4)";
            base.el.style.overflow = "hidden"; 

            selector.backColor = "white";
            selector.cornerRadius = [10,10,10,10];
            selector.height = "50px";
            selector.padding = [0,0,0,0];
            selector.el.style.height = "50px";       
            selector.el.style.marginTop = "10px";
            selector.el.style.padding = "0px";
            // selector.el.children[0].style.backgroundColor = "blue";
            selector.el.children[0].style.padding = "0px";
            selector.el.children[0].style.height = "30px";
            selector._div.style.backgroundColor = "red";
            selector._div.style.height = "30px";
            selector._div.style.display = "inline-block";
            app.Alert(selector._div.innerHTML);


            
            webview.el.style.boxShadow = "0 0px 20px 0 rgba(0,0,0,0.4)";
            webview.el.style.height = "auto";
            webview.el.style.width = "100%";
            webview.el.style.borderTop = "1px solid black";

        }
        return this.lays;
    }// _createEditor()--end
    

    _editorOnLoad(data){
        //  this.data.self.AceEditor = new this.window.AceEditor(JSON.parse(this.data.self._options_List));
        this.data.self.AceEditor = new this.window.AceEditor(_config_.init_options);
        let mode = this.data.self.Mode;
            this.data.self.AceEditor.options.setMode(mode);
        mode = mode[0].toUpperCase()+mode.slice(1);
            let idx =this.data.self._languageModes.indexOf(mode);
                this.data.self.lays.buttonBar.modeSelector.value = idx;

            //setTimeout(()=>{app.Alert(JSON.stringify(this.window.editor.session))},3000);
        this.loaded = true;
    }// _$web_viewOnLoad();
}// Editor Class-- END








//Found Editor CSS Classes
    // playing[0] = ace_text-input ;
    // playing[1] =| ace_gutter -> ace_layer, ace_gutter-layer, ace_folding-enabled; 
    //             |     <div> ==>> ace-gutter-cell; ace_gutter-active-line; 
    //             |-----|  <span> ==>> tabindex; tabindex;
    //             |_____</div>
    // playing[2] = ace_scroller -> ace_content; ==>> ace_layer; ace_print-margin-layer; ace_print-margin; ace_layer ace_marker-layer; ace_active-line; 
    //   ace_layer ace_text-layer; ace_line; ace_layer ace_curser-layer ace_marker-layer; ace_layer ace_curser-layer ace_hidden-cursers; ace_curser; 
    // playing[3] = ace_scrollbar ace_scrollbar-v; -> ace_scrollbar-inner;
    // playing[4] = ace_scrollbar ace_scrollbar-h; -> ace_scrollbar-inner;
    // 



/*
editor.commands.addCommand({
    name: 'myCommand',                                                                                                                                                                                                                                                                                                                                                      
    bindKey: {win: 'Ctrl-M',  mac: 'Command-M'},
    exec: function(editor) {
        //...
    }
});

editor.session.setMode("ace/mode/javascript");

var EditSession = require("ace/edit_session").EditSession
var js = new EditSession("some js code")
var css = new EditSession(["some", "css", "code here"])
// and then to load document into editor just call
editor.setSession(js)

editor.getSession().on('change', callback);
editor.getSession().selection.on('changeSelection', callback);
editor.getSession().selection.on('changeCursor', callback);

**Find**
editor.find('needle',{
  backwards: false,
  wrap: false,
  caseSensitive: false,
  wholeWord: false,
  regExp: false,
  range: null,
  start: null,
  skipCurrent: false
});
editor.findNext();
editor.findPrevious();

editor.replaceAll('bar');
editor.find('foo');
editor.replace('bar');

editor.setTheme("ace/theme/twilight");


editor.setReadOnly(true);  // false for the editable
editor.setShowPrintMargin(false);
editor.setHighlightActiveLine(false);
editor.getSession().setUseWrapMode(true);
document.getElementById('editor').style.fontSize='12px';
editor.getSession().setUseSoftTabs(true);
editor.getSession().setTabSize(4);
editor.session.getLength();
editor.gotoLine(lineNumber);
editor.selection.getCursor();
editor.insert("Something cool");
editor.session.getTextRange(editor.getSelectionRange());
editor.setValue("the new text here"); // or session.setValue
editor.getValue(); // or session.getValue

window.onload = function() {
  window.aceEditor = ace.edit("editor");
}
// Then elsewhere...
window.aceEditor.getSession().insert("Awesome!");


editor.destroy();
editor.container.remove();
*/
 






//
//
//
//
//
//
//
//
//
///
//
//
//
//
//
//
///
//
//
//
//
//
//
//
///