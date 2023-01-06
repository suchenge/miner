const styleCss = {
    miner: "width: 550px;height: 650px;border: 1px solid grey;float: left;position: fixed;z-index: 999; border-radius: 5px; background-color: white;margin: 5px;",
}

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
    height: 650px;
    border: 1px solid grey;
    float: left;
    position: absolute;
    z-index: 999; 
    border-radius: 5px; 
    background-color: white;
    margin: 5px;
}
.tabInfo{
    padding: 6px 10px; 
    text-align: left; 
    background-color: #E5F2F2;
    border-radius: 5px;
    height:25px;
}
.titleInfo{
    float:left; 
    font-size:20px; 
    cursor: pointer;
    color: #9999;
    line-height:20px;
}
.button{
    text-align: right; 
    margin: 2px 2px 0px 0px;
}
.button img{
    width: 25px;
    height: 25px;
    cursor: pointer;
}
.infoContent{
	padding: 10px 8px; 
    overflow-y: auto; 
    overflow-x:hidden; 
    height: 590px; 
    clear: both;
    font-family: Helvetica, arial, freesans, clean, sans-serif;
    font-size: 14px;
    color: #333;
}
.title{
	height:20px;
	line-height:20px;	
	color:#3f51b5;
	font-size:20px;
}
.title::before { 
	content: "●"; 
	font-size: 40px;
	line-height:15px;
	color:#3f51b5;
	margin-right:5px;
}
.title::after {
    content: " »";
    font-size: 20px;
	line-height:15px;
	color:#3f51b5;
	margin-right:5px;
}
.line{
    font-size:15px;
	margin-left:12px;
	padding-left:20px;
	line-height:30px;
	border-left-color: #999999;
	border-left-width: 1px;
	border-left-style: solid;
}
.line:first-child{
	padding-top:5px;
}
.line:last-child{
	padding-bottom:5px;
}
.line-before::before {
	content: "✔ "; 
	color: gray;
}
.infoContent::-webkit-scrollbar {
  width: 5px; 
}
.infoContent::-webkit-scrollbar-thumb {
    background: #ccc; 
    border-radius: 5px;
}
`);

        var screen_width = window.screen.availWidth;
        var screen_height = window.screen.availHeight;
        var X = (screen_width - 500) / 2;
        var Y = (screen_height - 650) / 2;

        this.container = $("<div class='miner'></div>");
        this.container.attr("style", styleCss.miner);
        this.container.css("left", X + "px");
        this.container.css("top", Y + "px");
        this.container.draggable();

        let tabInfo = $("<div class='tabInfo'></div>");
        tabInfo.append($("<div class='titleInfo'>" + this.title + " ×</div>"));
        tabInfo.append($("<div class='button'><img src='" + chrome.extension.getURL("images/download-2.png") + "'></img></div>"));

        this.infoContent = $("<div class='infoContent'></div>");

        this.container.append(style);
        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.hide();

        $("body").append(this.container);

        $(".titleInfo").click(() => {
            this.hide();
        });

        $(".button img").click(async () => {
            if (this.downloadEvent) await this.downloadEvent(this);
        });
    }
    setDownloadEvent(eventFunction) {
        this.downloadEvent = eventFunction;
    }
    writeLine = (line, value) => {
        let content = "无法获取到内容";
        if (value) {
            content = value;
        }

        let lineContent = $("<div class='line' id='miner-" + content.hashCode() + "'>" + content + "</div>");
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
        this.container.show();
    }
    clear() {
        this.infoContent.html("");
    }
}