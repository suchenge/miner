class CleanUpPopup{
    constructor(name, title) {
        this.name = name;
        this.title = title;

        this.container = null;
        this.infoContent = null;
    }

    create(){
        let style = $(`<style scoped>
                    .miner-clean-up-popup{
                        border: 1px solid grey;
                        position: fixed;
                        z-index: 999999; 
                        border-radius: 5px; 
                        background-color: white;
                        margin: 5px;
                    }
                    .miner-clean-up-popup .tabInfo{
                        padding: 6px 0; 
                        text-align: left; 
                        background-color: #E5F2F2;
                        border-radius: 5px;
                        
                    }
                    .miner-clean-up-popup .tabInfo div{
                        background-color: #E5F2F2;
                    }
                    .miner-clean-up-popup .titleInfo{
                        float: left; 
                        font-size: 18px; 
                        cursor: pointer;
                        color: #9999;
                        margin-left: 10px;
                    }
                    .miner-clean-up-popup .tabInfo .buttonInfo{
                        text-align: right;                     
                        padding-right: 10px;
                    }
                    .miner-clean-up-popup .tabInfo .buttonInfo img{
                        width: 25px;
                        height: 25px;
                        cursor: pointer;
                    }
                    .miner-clean-up-popup .infoContent{
                        padding: 10px 8px; 
                        overflow-y: auto; 
                        overflow-x: hidden; 
                        height: calc(100% - 50px);
                        clear: both;
                        font-family: Helvetica, arial, freesans, clean, sans-serif;
                        font-size: 14px;
                        color: #333;
                    }
                    .miner-clean-up-popup .title{
                        height: 20px;
                        line-height: 20px;	
                        color: #3f51b5;
                        font-size: 20px;
                        margin-bottom: 0;
                    }
                    .miner-clean-up-popup .title::before { 
                        content: "●"; 
                        font-size: 40px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner-clean-up-popup .title::after {
                        content: " »";
                        font-size: 20px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner-clean-up-popup .line div{
                        font-size: 14px;
                        line-height: 30px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .miner-clean-up-popup .line div:first-child{
                        width: 30%;
                        float: left;
                        margin-right: 10px;
                    }
                    .miner-clean-up-popup .line div:last-child{
                        width: 65%;
                        float: right;
                        margin-right: 10px;
                        text-decoration: line-through;
                    }
                    .miner-clean-up-popup .line span{
                        cursor: pointer;
                    }
                    .miner-clean-up-popup .line img{
                        float: left;
                        padding-right: 5px;
                        padding-top: 8px;
                    }
                    .miner-clean-up-popup .line input[type="checkbox"]{
                        height: 0; 
                        width: 0;
                        padding: 0;
                        margin: 0;
                        border: 0;
                    }
                    .miner-clean-up-popup .infoContent::-webkit-scrollbar {
                      width: 5px; 
                    }
                    .miner-clean-up-popup .infoContent::-webkit-scrollbar-thumb {
                        background: #ccc; 
                        border-radius: 5px;
                    }
                    .miner-clean-up-popup .infoContent textarea {
                        height: calc(100% - 30px);
                        width: calc(100% - 5px);
                        border: 1px solid dimgrey;
                        outline: none; 
                        resize: none;
                    }
                    </style>`);
        let calcContainerLocation = (container) => {
            const screen_width = window.innerWidth;
            const screen_height = window.innerHeight;

            const popup_width = screen_width - 100;
            const popup_height = screen_height - 100;

            const X = (screen_width - popup_width) / 2;
            const Y = (screen_height - popup_height) / 2;

            container.css("width", popup_width + "px");
            container.css("height", popup_height + "px");
            container.css("left", X + "px");
            container.css("top", Y + "px");
        };

        this.container = $("<div class='miner-clean-up-popup'></div>");
        calcContainerLocation(this.container);

        let tabInfo = $("<div class='tabInfo'></div>");
        let titleInfo = $("<div class='titleInfo'>" + this.title + " ×</div>");
        let buttonInfo = $("<div class='buttonInfo'><img id='clean-up-button' src='" + chrome.extension.getURL("images/clear-2.png") + "'></img></div>");

        tabInfo.append(titleInfo)
        tabInfo.append(buttonInfo);

        this.infoContent = $("<div class='infoContent'></div>");
        this.infoContent.append($("<textarea id='clean-up-textarea'></textarea>"));

        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.show();

        titleInfo.click(() => this.hide());
        $(buttonInfo.find("img")).click(async () => {
            let bookmarkContent = $("#clean-up-textarea").val();
            let bookmarks = eval(bookmarkContent);

            console.log(bookmarks);

            this.infoContent.html("");

            for (const bookmark of bookmarks) {
                if (bookmark.status === "done"){
                    let hashCode = bookmark.href.hashCode();

                    let line = $("<div class='line' hashCode='" + hashCode + "'></div>");
                    line.append($("<div>" + bookmark.href + "</div>"));
                    line.append($("<input type='checkbox' hashCode='"+ hashCode +"'/>"));
                    line.append($("<div><img src='" + chrome.extension.getURL("images/smail-loading.gif") + "'/></div>"));

                    this.infoContent.append(line);

                    sendMessage("bookmark", 1, bookmark.href);
                }
            }
        });

        let popup = $("<div></div>");
        popup.append(style);
        popup.append(this.container);

        $("body").append(popup);
    }

    hide() {
        this.infoContent.html("");
        this.container.hide();
    }
}