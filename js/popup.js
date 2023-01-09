class Popup {
    constructor(name, title) {
        this.name = name;
        this.title = title;

        this.container = null;
        this.infoContent = null;

        this.downloadEvent = null;
    }
    create() {
        let style = $("<style scoped></style>");
        style.html(`
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
    padding: 6px 0px; 
    text-align: left; 
    background-color: #E5F2F2;
    border-radius: 5px;
    height:30px;
}
.miner .tabInfo div{
    background-color: #E5F2F2;
    padding-bottom:5px;
}
.miner .titleInfo{
    float:left; 
    font-size:18px; 
    cursor: pointer;
    color: #9999;
    margin-left:10px;
}
.miner .tabInfo .downloadButton{
    text-align: right; 
    margin: 2px 2px 0px 0px;
    padding-right:10px;
}
.miner .tabInfo .downloadButton img{
    width: 25px;
    height: 25px;
    cursor: pointer;
}
.miner .infoContent{
	padding: 10px 8px; 
    overflow-y: auto; 
    overflow-x:hidden; 
    height: 620px; 
    clear: both;
    font-family: Helvetica, arial, freesans, clean, sans-serif;
    font-size: 14px;
    color: #333;
}
.miner .title{
	height:20px;
	line-height:20px;	
	color:#3f51b5;
	font-size:20px;
    margin-bottom: 0px;
}
.miner .title::before { 
	content: "●"; 
	font-size: 40px;
	line-height:15px;
	color:#3f51b5;
	margin-right:5px;
    box-sizing: revert;
}
.miner .title::after {
    content: " »";
    font-size: 20px;
	line-height:15px;
	color:#3f51b5;
	margin-right:5px;
    box-sizing: revert;
}
.miner .line{
    font-size:15px;
	margin-left:12px;
	padding-left:20px;
	line-height:30px;
	border-left-color: #999999;
	border-left-width: 1px;
	border-left-style: solid;
    cursor: pointer;
}
.miner .line:first-child{
	padding-top:5px;
}
.miner .line:last-child{
	padding-bottom:5px;
}
.miner .line-before::before {
	content: "✔ "; 
	color: #3f51b5;
    box-sizing: revert;
}
.miner .line-before-selected::before {
	content: "✔ "; 
	color: gray;
    box-sizing: revert;
}
.miner .line span{
    cursor: pointer;
    color: gray;
}
.miner .infoContent::-webkit-scrollbar {
  width: 5px; 
}
.miner .infoContent::-webkit-scrollbar-thumb {
    background: #ccc; 
    border-radius: 5px;
}
.miner .line input[type="checkbox"]{
    height: 0px; 
    width: 0px;
    padding: 0px;
    margin: 0px;
    border: 0px;
}
`);

        var screen_width = document.body.clientWidth;
        var screen_height = window.innerHeight;
        var X = (screen_width - 500) / 2;
        var Y = (screen_height - 650) / 2;

        this.container = $("<div class='miner'></div>");
        this.container.css("left", X + "px");
        this.container.css("top", Y + "px");
        this.container.draggable();

        let tabInfo = $("<div class='tabInfo'></div>");
        tabInfo.append($("<div class='titleInfo'>" + this.title + " ×</div>"));
        tabInfo.append($("<div class='downloadButton'><img src='" + chrome.extension.getURL("images/download-2.png") + "'></img></div>"));

        this.infoContent = $("<div class='infoContent'></div>");

        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.hide();

        let popup = $("<div></div>");
        popup.append(style);
        popup.append(this.container);

        $("body").append(popup);

        $(".titleInfo").click(() => {
            this.hide();
        });

        $(".downloadButton img").click(async () => {
            if (this.downloadEvent) await this.downloadEvent(this);
        });

        this.selectedHashCodes = [];
    }
    setDownloadEvent(eventFunction) {
        this.downloadEvent = eventFunction;
    }
    writeLine = (line, value) => {
        let hashCode = null;
        let content = "无法获取到内容";
        if (value) {
            content = value;
        }

        let lineContent = $("<div class='line' hashCode='miner-" + content.hashCode() + "'><input type='checkbox' hashCode='miner-" + content.hashCode() + "'></input>" + content + "</div>");
        let deleteSpan = $("<span>✔ </span>");
        lineContent.click(() => {
            lineContent.addClass("line-before-selected");
            lineContent.attr("selected", "selected");
            deleteSpan.remove();
            this.selectedHashCodes.push(content.hashCode());
        });
        lineContent.hover(() => {
            if (!lineContent.attr("selected") || lineContent.attr("selected") != "selected")
                lineContent.prepend(deleteSpan);
        }, () => {
            deleteSpan.remove();
        });
        line.append(lineContent);
    };
    async write(getContent) {

        let line = $("<div></div>");

        let loading = $("<img src='" + chrome.extension.getURL("images/loading.gif") + "'/>");

        line.append(loading);
        this.infoContent.append(line);

        let content = await getContent();
        loading.remove();

        if (content) {
            for (const key in content) {
                let description = $("<div class='title'>" + key + "</div>");
                line.append(description);

                let lineValue = $("<div></div>");
                line.append(lineValue);

                let valueContent = content[key];
                if (valueContent) {
                    if (valueContent instanceof Array) {
                        valueContent.forEach(value => {
                            this.writeLine(lineValue, value);
                        })
                    } else {
                        this.writeLine(lineValue, valueContent)
                    }
                }
            }
        } else {
            writeLine(line);
        }
    }
    hide() {
        this.infoContent.html("");
        this.container.hide();
    }
    show() {
        this.container.css("position","fixed");
        this.container.show();
        this.infoContent.html("");
    }
    clear() {
        this.infoContent.html("");
    }
    sign(hashCode){
        let elementMatch = "miner-" + hashCode;
        console.log(elementMatch);
        let inputElement = $("input[hashCode='" + elementMatch + "']");
        let lineElement = $("div[hashCode='" + elementMatch + "']");
        lineElement.removeClass("line-before-selected");
        lineElement.addClass("line-before");
        inputElement.focus();
    }
    matchLine(hashCode){
        if (this.selectedHashCodes.length <= 0) return true;
        return this.selectedHashCodes.includes(hashCode);
    }
}