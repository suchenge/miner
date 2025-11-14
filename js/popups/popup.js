class Popup {
    constructor(name, title) {
        this.name = name;
        this.title = title;

        this.container = null;
        this.infoContent = null;

        this.downloadEvent = null;
        this.closeEvent = null;
        this.counter = null;
        this.lineLength = 0;
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
                    }
                    .miner .tabInfo div{
                        background-color: #E5F2F2;
                    }
                    .miner .titleInfo{
                        float: left; 
                        font-size: 18px; 
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
                        padding-top: 10px;
                        padding-left: 8px;
                        padding-right: 8px;
                        overflow-y: auto; 
                        overflow-x: hidden; 
                        height: calc(100% - 50px);
                        clear: both;
                        font-family: Helvetica, arial, freesans, clean, sans-serif;
                        font-size: 14px;
                        color: #333;
                    }
                    .miner .titleContainer{
                        float: left;
                        width: calc(100% - 35px);
                    }
                    .miner .title{
                        height: 20px;
                        line-height: 20px;	
                        color: #3f51b5;
                        font-size: 20px;
                        margin-bottom: 0;
                        clear:both;
                    }
                    .miner .title::before { 
                        content: "●"; 
                        font-size: 25px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner .title::after {
                        content: " »";
                        font-size: 25px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner .lineContainer{
                        margin-top: -5px;
                        margin-bottom: -3px;
                        margin-left: 7px;
                        padding-left: 20px;
                        line-height: 30px;
                        border-left-color: #999999;
                        border-left-width: 1px;
                        border-left-style: solid;
                        word-wrap: break-word;
                        box-sizing: revert;
                    }
                    .miner .line{
                        font-size: 14px;
                        
                        clear: both;
                    }
                    .miner .file{
                        height: 30px;
                    }
                    .miner .line:first-child{
                        padding-top:5px;
                    }
                    .miner .line:last-child{
                        padding-bottom: 10px;
                    }
                    .miner .line .status{
                        cursor: pointer;
                        float: left;
                        width: 20px;
                    }
                    .miner .line .url{
                        cursor: pointer;
                        overflow: hidden; 
                        text-overflow: ellipsis; 
                        -o-text-overflow: ellipsis;
                        white-space:nowrap;
                        width: calc(100% - 25px);
                        float: right;
                    }
                    .miner .line .url:hover{
                        color: blue;
                        text-decoration: underline;
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
                    .miner .counter{
                        font-size: 20px;
                        float: right;
                        padding-right: 10px;
                        font-weight: bold;
                    }
                    </style>`);

        let calcContainerLocation = (container) => {
            const screen_width = window.innerWidth;
            const screen_height = window.innerHeight;
            const X = screen_width - 575;
            const Y = screen_height - 670;


            container.css("left", X + "px");
            container.css("top", Y + "px");
        };

        this.container = $("<div class='miner'></div>");
        this.container.draggable();
        calcContainerLocation(this.container);

        this.counter = $("<div class='counter'></div>");
        this.counter.hide();

        let tabInfo = $("<div class='tabInfo'></div>");
        let titleContainer = $("<div class='titleContainer'></div>");
        let titleInfo = $("<div class='titleInfo'>" + this.title + " ×</div>");

        titleContainer.append(titleInfo);
        titleContainer.append(this.counter);

        tabInfo.append(titleContainer);
        tabInfo.append($("<div class='downloadButton'><img src='" + chrome.runtime.getURL("images/download-2.png") + "'></img></div>"));

        this.loadingElement = $("<img src='" + chrome.runtime.getURL("images/loading.gif") + "'/>");
        this.infoContent = $("<div class='infoContent'></div>");
        this.infoContent.append(this.loadingElement);

        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.hide();

        let popup = $("<div></div>");
        popup.append(style);
        popup.append(this.container);

        $("body").append(popup);
        $(window).resize(() => calcContainerLocation(this.container));

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
        this.lineLength = 0;
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

    selectedLine(event){
        if (event === "add") this.lineLength += 1;
        else this.lineLength -= 1;

        this.counter.text(this.lineLength);
    }

    writeLine(content){
        let value = "无法获取到内容";

        if (content && content.toString() !== undefined) value = content;

        let popupLine = new PopupLine(value, this.isCanBeSelectEvent, this.isDefaultSelectedEvent, this);
        let line = popupLine.get();

        this.lines.push(popupLine);

        this.lastLineContainer.append(line);
        this.loadingElement.hide();
    }

    writeTitle(title){
        this.loadingElement.hide();

        this.lastLineContainer = $("<div class='lineContainer'></div>");

        this.infoContent.append($("<div class='title'>" + this.titleFormat(title) + "</div>"));
        this.infoContent.append(this.lastLineContainer);
    }

    titleFormat(title){
        return title.charAt(0).toUpperCase() + title.slice(1)
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

            this.counter.show();

            let infoContentHeight = this.infoContent.outerHeight(true);
            let children = this.infoContent.children();
            let lastChildren = children[children.length - 1];
            let childrenHeight = 0;

            Array.from(children).forEach(x => childrenHeight += $(x).outerHeight(true));

            let lastChildrenHeight = infoContentHeight - childrenHeight;
            if (lastChildrenHeight > 0){
                let lastElement = $(lastChildren);
                lastElement.height(lastChildrenHeight + lastElement.outerHeight(true) + 15);
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
    constructor(content, isCanBeSelectEvent, isDefaultSelectedEvent, popup) {
        this.content = content;
        this.element = null;
        this.signElement = null;
        this.state = "";
        this.isCanBeSelectEvent = isCanBeSelectEvent;
        this.isDefaultSelected = isDefaultSelectedEvent;
        this.popup = popup;
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
        this.element = $("<div class='line'></div>");

        if (this.isCanBeSelectEvent(this.content)) {
            this.element.addClass("file");
            
            let defaultSelected = this.isDefaultSelected(this.content);
            let selectLineElement = $("<div></div");

            this.signElement = $("<span class='status'>◎</span>");
            this.signElement.click(() => this.selected());
            
            let urlElement = $("<span class='url'>" + this.content.url + "</span>");
            
            urlElement.click(() => {
                let url = this.content.url;

                console.log(url);
                sendMessage("openUrl", "", { url: url }, response => {});
            });

            selectLineElement.append(this.signElement);
            selectLineElement.append(urlElement);

            this.element.append(selectLineElement);
            this.element.append("<input type='checkbox'/>");

            if (defaultSelected) this.selected()
        }
        else this.element.append("<span>" + this.content.toString() + "</span>");
        
        return this.element;
    }

    focus(){
        this.element.find("input[type='checkbox']").focus();
    }

    selected(){
        if (this.state === "selected"){
            this.state = "";
            this.signElement.text("");
            this.signElement.text("◎");
            this.popup.selectedLine("subtract")
        }else if (this.state === ""){
            this.state = "selected";
            this.signElement.text("");
            this.signElement.text("✔");
            this.popup.selectedLine("add")
        }
    }

    loading(){
        this.signElement.text("");
        this.signElement.append("<img src='" + chrome.runtime.getURL("images/smail-loading.gif") + "'/>");
    }
    
    sign(state){
        if (state) {
            this.signElement.html("");
            this.signElement.text("✔");
            this.signElement.css("color", "#3f51b5");
            this.popup.selectedLine("subtract");
            //setTimeout(() => this.element.hide(), 500);
        }
        else {
            this.signElement.text("");
            this.signElement.text("✘");
            this.signElement.css("color", "red");
        }

        this.signElement.show();
    }
}