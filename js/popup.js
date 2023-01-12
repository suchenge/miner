class Popup {
    constructor(name, title) {
        this.name = name;
        this.title = title;

        this.container = null;
        this.infoContent = null;

        this.downloadEvent = null;
        this.closeEvent = null;
    }
    create() {
        let style = $(`<style scoped>
                    .miner{
                        width: 550px;
                        height: 660px;
                        border: 1px solid grey;
                        position: fixed;
                        z-index: 999; 
                        border-radius: 5px; 
                        background-color: white;
                        margin: 5px;
                    }
                    .miner .tabInfo{
                        padding: 6px 0; 
                        text-align: left; 
                        background-color: #E5F2F2;
                        border-radius: 5px;
                        height: 30px;
                    }
                    .miner .tabInfo div{
                        background-color: #E5F2F2;
                    }
                    .miner .titleInfo{
                        float: left; 
                        font-size:18px; 
                        cursor: pointer;
                        color: #9999;
                        margin-left: 10px;
                    }
                    .miner .tabInfo .downloadButton{
                        text-align: right; 
                        
                        padding-right: 10px;
                    }
                    .miner .tabInfo .downloadButton img{
                        width: 25px;
                        height: 25px;
                        cursor: pointer;
                    }
                    .miner .infoContent{
                        padding: 10px 8px; 
                        overflow-y: auto; 
                        overflow-x: hidden; 
                        height: 595px; 
                        clear: both;
                        font-family: Helvetica, arial, freesans, clean, sans-serif;
                        font-size: 14px;
                        color: #333;
                    }
                    .miner .title{
                        height: 20px;
                        line-height: 20px;	
                        color: #3f51b5;
                        font-size: 20px;
                        margin-bottom: 0;
                    }
                    .miner .title::before { 
                        content: "●"; 
                        font-size: 40px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner .title::after {
                        content: " »";
                        font-size: 20px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner .line{
                        font-size: 14px;
                        margin-left: 12px;
                        padding-left: 20px;
                        line-height: 30px;
                        border-left-color: #999999;
                        border-left-width: 1px;
                        border-left-style: solid;
                        word-wrap: break-word;
                    }
                    .miner .line:first-child{
                        padding-top:5px;
                    }
                    .miner .line:last-child{
                        padding-bottom: 5px;
                    }
                    .miner .line span{
                        cursor: pointer;
                    }
                    .miner .line img{
                        float: left;
                        padding-right: 5px;
                        padding-top: 8px;
                    }
                    .miner .line input[type="checkbox"]{
                        height: 0; 
                        width: 0;
                        padding: 0;
                        margin: 0;
                        border: 0;
                    }
                    .miner .infoContent::-webkit-scrollbar {
                      width: 5px; 
                    }
                    .miner .infoContent::-webkit-scrollbar-thumb {
                        background: #ccc; 
                        border-radius: 5px;
                    }
                    </style>`);

        const screen_width = window.innerWidth;
        const screen_height = window.innerHeight;
        const X = (screen_width - 550) / 2;
        const Y = (screen_height - 660) / 2;

        this.container = $("<div class='miner'></div>");
        this.container.css("left", X + "px");
        this.container.css("top", Y + "px");
        this.container.draggable();

        let tabInfo = $("<div class='tabInfo'></div>");
        tabInfo.append($("<div class='titleInfo'>" + this.title + " ×</div>"));
        tabInfo.append($("<div class='downloadButton'><img src='" + chrome.extension.getURL("images/download-2.png") + "'></img></div>"));

        this.loadingElement = $("<img src='" + chrome.extension.getURL("images/loading.gif") + "'/>");
        this.infoContent = $("<div class='infoContent'></div>");
        this.infoContent.append(this.loadingElement);

        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.hide();

        let popup = $("<div></div>");
        popup.append(style);
        popup.append(this.container);

        $("body").append(popup);

        $(".titleInfo").click(() => this.hide());
        $(".downloadButton img").click(() => {
            this.lines.forEach(line => {
                if (line.state === "selected"){
                    line.loading();
                    this.downloadEvent(line);
                }
            })
        });

        this.lastLineContainer = null;
        this.lines = [];
        this.isDefaultSelectedEvent = null;
        this.isCanBeSelectEvent = null;
        this.downloadEvent = null;
    }
    download(event){
        this.downloadEvent = event;
    }
    isCanBeSelect(event){
        this.isCanBeSelectEvent = event;
    }
    isDefaultSelected(event){
        this.isDefaultSelectedEvent = event;
    }

    writeLine(content){
        let value = "无法获取到内容";

        if (content && content.toString() !== undefined) value = content;

        let popupLine = new PopupLine(value, this.isCanBeSelectEvent, this.isDefaultSelectedEvent);
        let line = popupLine.get();

        this.lines.push(popupLine);

        this.lastLineContainer.append(line);
        this.loadingElement.hide();
    }

    writeTitle(title){
        this.loadingElement.hide();

        this.lastLineContainer = $("<div class='lineContainer'></div>");

        this.infoContent.append($("<div class='title'>" + title + "</div>"));
        this.infoContent.append(this.lastLineContainer);
    }

    async write(getContentEvent){
        let content = await getContentEvent();
        if (content) {
            for (const key in content){
                this.writeTitle(key);

                let value = content[key];

                if (value instanceof Array) value.forEach(valueLine => this.writeLine(valueLine));
                else this.writeLine(value);
            }
        }
    }
    hide() {
        this.infoContent.html("");
        this.container.hide();
        if (this.closeEvent) this.closeEvent(this);
    }
    show() {
        this.container.css("position","fixed");
        this.container.show();
    }
    sign(hashCode, state){
        let line = this.lines.find(x => x.hashCode === hashCode);
        if (line) {
            line.focus();
            line.sign(state);
        }
    }
}

class PopupLine{
    constructor(content, isCanBeSelectEvent, isDefaultSelectedEvent) {
        this.content = content;
        this.element = null;
        this.signElement = null;
        this.state = "";
        this.isCanBeSelectEvent = isCanBeSelectEvent;
        this.isDefaultSelected = isDefaultSelectedEvent;
        this.hashCode = content["hashCode"] ?? this.content.hashCode();
    }
    addAttrs(element){
        if (element){
            if (this.content instanceof Object){
                for(const key in this.content){
                    this.addAttr(element, key, this.content[key]);
                }
            }
        }
    }
    addAttr(element, key, value){
        if (element && value && typeof value === "string"){
            element.attr("miner-" + key, value);
        }
    }
    get() {
        this.signElement = $("<span>✔ </span>");
        this.signElement.hide();

        this.loadingElement = $("<img src='" + chrome.extension.getURL("images/smail-loading.gif") + "'/>");
        this.loadingElement.hide();

        this.element = $("<div class='line'></div>");
        this.addAttrs(this.element);

        let defaultSelected = this.isDefaultSelected(this.content);

        if (this.isCanBeSelectEvent(this.content)) {
            this.element.append(this.signElement);
            this.element.append(this.loadingElement);
            this.element.append("<input type='checkbox'/>");

            if (!defaultSelected) {
                this.element.click(() => this.selected());
                this.element.hover(
                    () => {
                        if (this.state === "") this.signElement.show()
                    },
                    () => {
                        if (this.state === "") this.signElement.hide()
                    }
                );
            }else this.selected();
        }

        this.element.append("<span>" + this.content.toString() + "</span>");
        return this.element;
    }

    focus(){
        this.element.find("input[type='checkbox']").focus();
    }
    selected(){
        if (this.state === "selected"){
            this.state = "";
            this.signElement.hide();
        }else if (this.state === ""){
            this.state = "selected";
            this.signElement.show();
        }
    }
    loading(){
        this.signElement.hide()
        this.loadingElement.show();
    }
    sign(state){
        this.loadingElement.hide();

        if (state) this.signElement.css("color", "#3f51b5");
        else {
            this.signElement.text("✘ ");
            this.signElement.css("color", "red");
        }
        this.signElement.show();
    }
}