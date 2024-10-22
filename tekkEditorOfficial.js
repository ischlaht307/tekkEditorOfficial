ui.script("./config.module.js");
cfg.Portrait
class Main extends App{
    onStart(){
  
 
        this.layMain = ui.addLayout( "main", "linear", "fillxy,vcenter" )

        this.txt = ui.addText( this.layMain, "My Hybrid app")

        this.btn = ui.addButton( this.layMain, "My Button", "primary" )
        this.btn.setOnTouch( ()=>{ app.Vibrate( "0,100,30,100" ); } )
        
        this.editor = new Editor(this.layMain, 0.98, 0.90);
    }
}



class Editor{
    constructor(layout, width, height){
        this.self = this;
        this.loaded = false;
        this.lay = layout;
        this.width = width;
        this.height = height;
        this.lays = {base: null};
          this.config_keys_array = Object.keys(_config);
          this.config_jCache = null;
          
          this._config = (function(self){
              if(self.config_jCache) return self.config_jCache;
              else{
                  if(app.FileExists("AceEditor/config.json") ){
                      self.config_jCache = app.ReadFile("AceEditor/config.json");
                           return self.config_jCache;
                  }
                  else{
                      const file = app.WriteFile("./AceEditor/config.json", JSON.stringify(_config));
                          if(!app.ReadFile("./AceEditor/config.json")) app.Error("Failed to intitalise Ace Editor configuration", 0,"./TekkEditor.js", true);
                              self.config_jCache = JSON.stringify(_config)
                             return self.config_jCache;
                   }// inner else---end
              }// outer else--end
            })(this.self);//this._config--end
            
            this._createEditor();
    }// constructor
    updateEditorOption(opt){
        let optObject = JSON.parse(this._config);
        let {name, value, callback} = opt;
            
    }
    
    _createEditor(){
    
        //if(!this.lays.base){
            this.base_Lay = ui.addLayout(this.lay, "Linear","Top,ScrollXY", this.width, this.height );
            this.button_bar = ui.addLayout(this.base_Lay, "Linear", "FillX", -1, 0.1);

            this.modeSelector = ui.addSelect(this.button_bar, "Select Mode", "FillXY", -1, -1);
            this.modeSelector.backColor = "white";
            this.modeSelector.cornerRadius = [20,20,20,20];
            this.modeSelector.list = ["JavaScript", "HTML", "CSS"];
            this.modeSelector.setOnTouch();
            this.web_view = ui.addWebView(this.base_Lay, "./AceEditor.html", "FillXY", -1, -1);
            this.web_view.data.self = this;
            this.web_view.setOnLoad(this._editorOnLoad);
        
            this.base_Lay.border = "24px";
            this.base_Lay.padding = [0.01,0.01,0.01,0.01];
            this.base_Lay.cornerRadius = [10,10,10,10];
            this.base_Lay.backColor = "black";
            this.web_view.el.style.height = "100%";
            this.web_view.el.style.width = "100%";
            this.web_view.el.style.radius = "10px";
            
    }// _()
    

    _editorOnLoad(data){
       this.window.setUpOptions(_config.init_options);
        //this.window.findc();
        let modeScript = this.document.getElementById("lang-mode");
            modeScript.innerHTML = "editor.session.setMode(\'ace/mode/javascript\');";
        this.loaded = true;
    }// _$web_viewOnLoad();
    
}// Editor Class-- END

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