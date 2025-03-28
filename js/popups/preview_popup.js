class PreviewPopup {
    constructor(name, title) {
        this.name = name;
        this.title = title;
        console.log(this.title);

        this.container = null;
        this.infoContent = null;

        this.image_container_width = 0;
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
                    .miner-preview-popup .tabInfo .buttonInfo span{
                        width: 25px;
                        height: 25px;
                        cursor: pointer;
                        margin-left: 20px;
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
                        border: 0 solid dimgrey;
                        outline: none; 
                        resize: none;
                        display:none;
                    }
                    .miner-preview-popup .image_container {
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
                        width: calc(100%);
                        cursor: pointer;
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

            this.image_container_width = ((popup_width) / 6) - 40;
        };

        this.container = $("<div class='miner-preview-popup'></div>");
        calcContainerLocation(this.container);

        let tabInfo = $("<div class='tabInfo'></div>");
        let titleInfo = $("<div class='titleInfo'>" + this.title + " ×</div>");

        let appendToBlackListButton = $("<span>加入黑名单</span>");
        appendToBlackListButton.click(() => {
            let hashCodes = this.getSelectedHashCodes();

            if (hashCodes.length <= 0) return;

            let new_black_urls = [];

            hashCodes.forEach(code => {
                let div = $('#miner-preview-popup-' + code + '');
                let url = div.find("img").attr('src');
                new_black_urls.push(url);
                div.remove();
            });

            sendMessage("appendBlackUrls",1, new_black_urls);
        });

        let deleteImageButton = $("<span>删除</span>");
        deleteImageButton.click(() => this.getSelectedHashCodes().forEach(code => $('#miner-preview-popup-' + code + '').remove()));

        let copyUrlButton = $("<span>复制链接</span>");
        copyUrlButton.click(() => {
            let content = '';
            Array.from($('.image_container img')).forEach(img => content += $(img).attr('src') + '\n');

            let control = $("#preview-popup-textarea");
            control.val(content);
            control.select();

            document.execCommand('copy');
        });

        let downloadUrlButton = $("<span>下载</span>")
        downloadUrlButton.click(() => {
            Array.from($('.image_container img')).forEach((img, index) => {
                let url = $(img).attr('src');
                let urlGroup = url.split("/");
                let nameGroup = urlGroup[urlGroup.length - 1].split(".");
                let type = nameGroup[nameGroup.length - 1];
                let seq = ('' + index).padStart(5, '0');
                let dir = replaceBadFileName($(".titleInfo").text().replace("×","").trim());
                let path = 'Picture/temp/' + dir + '/' + seq + '.' + type;

                console.log(path);
                
                sendMessage("download", index, {
                    url: url,
                    filename: path,
                    method: "GET",
                    conflictAction: "overwrite",
                    saveAs: false,
                }, response => {});
            
            });            
        });

        let buttonInfo = $("<div class='buttonInfo'></div>");

        buttonInfo.append(appendToBlackListButton);
        buttonInfo.append(deleteImageButton);
        buttonInfo.append(copyUrlButton);
        buttonInfo.append(downloadUrlButton);

        tabInfo.append(titleInfo)
        tabInfo.append(buttonInfo);

        this.infoContent = $("<div class='infoContent'></div>");
        this.infoContent.append($("<textarea id='preview-popup-textarea'></textarea>"));

        this.container.append(tabInfo);
        this.container.append(this.infoContent);
        this.container.show();

        titleInfo.click(() => this.hide());

        let popup = $("<div></div>");
        popup.append(style);
        popup.append(this.container);

        $("body").append(popup);
    };

    getSelectedHashCodes() {
        let result = [];
        let selected_images = $(".image_container input:checkbox:checked");

        Array.from(selected_images)
            .forEach((images, index) => {
                let hashCode = $(images).attr('hashCode');
                result.push(hashCode);
            });

        return result;
    };

    hide() {
        this.infoContent.html("");
        this.container.hide();
    }

    write_line(url){
        let url_hashCode = url.hashCode();

        let image_container = $(`<div id='miner-preview-popup-${url_hashCode}' class='image_container' style='width:${this.image_container_width}px'></div>`);
        let image_checkbox = $("<input type='checkbox' hashCode='" + url_hashCode + "'>");

        //let image_control = $("<a href='" + url +"' target='_blank'></a>");
        let image_control = $("<img alt='" + url + "' src='" + url + "'/>");

        image_control.click(async (e) => {
            const imageUrl = $(e.currentTarget).attr("src");
            console.log(imageUrl);
            sendMessage("openUrl", "", {url: imageUrl, active: false}, response => {});
        });

        image_container.append(image_checkbox);
        image_container.append(image_control);

        this.infoContent.append(image_container);
    }
}