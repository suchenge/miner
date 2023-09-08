class PreviewPopup {
    constructor(name, title) {
        this.name = name;
        this.title = title;

        this.container = null;
        this.infoContent = null;
    }

    create() {
        let style = $(`<style scoped>
                    .miner-preview-popup{
                        border: 1px solid grey;
                        position: fixed;
                        z-index: 999999; 
                        border-radius: 5px; 
                        background-color: white;
                        margin: 5px;
                    }
                    .miner-preview-popup .tabInfo{
                        padding: 6px 0; 
                        text-align: left; 
                        background-color: #E5F2F2;
                        border-radius: 5px;
                        
                    }
                    .miner-preview-popup .tabInfo div{
                        background-color: #E5F2F2;
                    }
                    .miner-preview-popup .titleInfo{
                        float: left; 
                        font-size: 18px; 
                        cursor: pointer;
                        color: #9999;
                        margin-left: 10px;
                    }
                    .miner-preview-popup .tabInfo .buttonInfo{
                        text-align: right;                     
                        padding-right: 10px;
                    }
                    .miner-preview-popup .tabInfo .buttonInfo img{
                        width: 25px;
                        height: 25px;
                        cursor: pointer;
                    }
                    .miner-preview-popup .infoContent{
                        padding: 10px 8px; 
                        overflow-y: auto; 
                        overflow-x: hidden; 
                        height: calc(100% - 50px);
                        clear: both;
                        font-family: Helvetica, arial, freesans, clean, sans-serif;
                        font-size: 14px;
                        color: #333;
                    }
                    .miner-preview-popup .title{
                        height: 20px;
                        line-height: 20px;	
                        color: #3f51b5;
                        font-size: 20px;
                        margin-bottom: 0;
                    }
                    .miner-preview-popup .title::before { 
                        content: "●"; 
                        font-size: 40px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner-preview-popup .title::after {
                        content: " »";
                        font-size: 20px;
                        line-height: 15px;
                        color: #3f51b5;
                        margin-right: 5px;
                        box-sizing: revert;
                    }
                    .miner-preview-popup .line div{
                        font-size: 14px;
                        line-height: 30px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                    .miner-preview-popup .line div:first-child{
                        width: 30%;
                        float: left;
                        margin-right: 10px;
                    }
                    .miner-preview-popup .line div:last-child{
                        width: 65%;
                        float: right;
                        margin-right: 10px;
                    }
                    .miner-preview-popup .line span{
                        cursor: pointer;
                    }
                    .miner-preview-popup .line img{
                        float: left;
                        padding-right: 5px;
                        padding-top: 8px;
                    }
                    .miner-preview-popup .line input[type="checkbox"]{
                        height: 0; 
                        width: 0;
                        padding: 0;
                        margin: 0;
                        border: 0;
                    }
                    .miner-preview-popup .infoContent::-webkit-scrollbar {
                      width: 5px; 
                    }
                    .miner-preview-popup .infoContent::-webkit-scrollbar-thumb {
                        background: #ccc; 
                        border-radius: 5px;
                    }
                    .miner-preview-popup .infoContent textarea {
                        height: 0;
                        width: 0;
                        border: 1px solid dimgrey;
                        outline: none; 
                        resize: none;
                    }
                    .miner-preview-popup .image_container {
                        height: calc(28%);
                        width: calc(18%);
                        border: 1px solid dimgrey;
                        float: left;
                        padding: 10px;
                        margin: 5px;
                        outline: none; 
                        resize: none;
                        &:hover .image_delete {
                            display: block;
                        }
                    }
                    .miner-preview-popup .image_container .image_delete {
                        display: none;
                        position: absolute;
                        float: right;
                        color: dimgrey;
                        margin: 5px;
                        font-size: 25px;
                        cursor: pointer;
                    }
                    .miner-preview-popup .image_container img {
                        height: calc(100% - 15px);
                        width: calc(100%);
                    }
                    .miner-preview-popup .miner-preview-popup-url {
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        overflow: hidden;
                        font-size: 12px;
                        color: darkgrey;
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

        this.container = $("<div class='miner-preview-popup'></div>");
        calcContainerLocation(this.container);

        let tabInfo = $("<div class='tabInfo'></div>");
        let titleInfo = $("<div class='titleInfo'>" + this.title + " ×</div>");
        let buttonInfo = $("<div class='buttonInfo'><img id='preview-copy-button' src='" + chrome.extension.getURL("images/copy.png") + "'></img></div>");

        tabInfo.append(titleInfo)
        tabInfo.append(buttonInfo);

        this.infoContent = $("<div class='infoContent'></div>");
        this.infoContent.append($("<textarea id='preview-popup-textarea'></textarea>"));

        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.show();

        titleInfo.click(() => this.hide());

        $(buttonInfo.find("img")).click(() => {
            let content = '';
            Array.from($('.image_container img')).forEach(img => content += $(img).attr('src') + '\n');
            let control = $("#preview-popup-textarea");
            control.val(content);
            control.select();
            document.execCommand('copy');
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

    write_line(url){
        let image_container = $("<div id='miner-preview-popup-" + url.hashCode() + "' class='image_container'></div>");
        let image_control = $("<img alt='" + url + "' src='" + url + "'/><div class='miner-preview-popup-url'>" + url + "</div>");

        let image_delete = $("<div hashCode='" + url.hashCode() + "' class='image_delete'>✖</div>");
        image_delete.click(e => {
            let hashCode = $(e.delegateTarget).attr('hashCode')
            $('#miner-preview-popup-' + hashCode + '').remove();
        });

        image_container.append(image_delete);
        image_container.append(image_control);

        this.infoContent.append(image_container);
    }
}