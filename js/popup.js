const styleCss = {
    miner: "width: 550px;height: 650px;border: 1px solid grey;float: left;position: absolute;z-index: 999; border-radius: 5px; background-color: white;margin: 5px;",
    tabInfo: "padding: 6px 10px; text-align: left; background-color: #E5F2F2;height: 40px; border-radius: 5px;",
    infoContent: "padding: 5px 15px; overflow-y: auto; overflow-x:hidden; height: 610px; clear: both;",
    description: "color: #70aeff;font-weight: bold;font-size: 16px; margin:5px 0px; border-bottom-color: #909399;border-bottom-style: solid;border-bottom-width: 0.5px; width:350px",
    lineContent: "color: #000000;font-weight: normal; font-size:14px; padding: 5px 0px;clear: both;",
    titleInfo: "float:left; font-size:20px; cursor: pointer;",
    downloadButton: "text-align: right; margin: 2px 2px 0px 0px",
    downloadButtonImg: "width: 25px;height: 25px;cursor: pointer;"
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
        var screen_width = window.screen.availWidth;
        var screen_height = window.screen.availHeight;
        var X = (screen_width - 500) / 2;
        var Y = (screen_height - 650) / 2;

        this.container = $("<div id='" + this.name + "'></div>");
        this.container.attr("style", styleCss.miner);
        this.container.css("left", X + "px");
        this.container.css("top", Y + "px");
        this.container.draggable();

        let titleInfo = $("<div>" + this.title + " ×</div>");
        titleInfo.attr("style", styleCss.titleInfo);

        let downloadButtonImg = $("<img src='" + chrome.extension.getURL("images/download-2.png") + "'></img>");
        downloadButtonImg.attr("style", styleCss.downloadButtonImg);

        let downloadButton = $("<div></div>");
        downloadButton.attr("style", styleCss.downloadButton);
        downloadButton.append(downloadButtonImg);

        let tabInfo = $("<div></div>");
        tabInfo.attr("style", styleCss.tabInfo);
        tabInfo.append(titleInfo);
        tabInfo.append(downloadButton);

        this.infoContent = $("<div id='miner-webkit-scrollbar'></div>");
        this.infoContent.attr("style", styleCss.infoContent);
        
        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.hide();

        $("body").append(this.container);

        titleInfo.click(() => {
            this.hide();
        });

        downloadButtonImg.click(async () => {
            if (this.downloadEvent) await this.downloadEvent(this);
        });
    }
    setDownloadEvent(eventFunction){
        this.downloadEvent = eventFunction;
    }
    writeLine = (line, value) => {
        let content = "无法获取到内容";
        if (value) {
            content = value;
        }

        let lineContent = $("<div>" + content + "</div>");
        lineContent.attr("style", styleCss.lineContent);

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
                let description = $("<div>" + key + " »</div>");
                description.attr("style", styleCss.description);

                line.append(description);

                let valueContent = content[key];
                if (valueContent) {
                    if (valueContent instanceof Array) {
                        valueContent.forEach(value => {
                            this.writeLine(line, value);
                        })
                    } else {
                        this.writeLine(line, valueContent)
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