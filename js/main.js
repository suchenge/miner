chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let popup = new Popup("miner", "矿工");

async function excavate(){
    const imgs = $(document.body).find("img");
    const links = $(document.body).find("a");

    let urls = [];
    let current_url = window.location.href;

    //let title = "清洁工";

    let title = $("title").text();
    if (current_url.includes("sehuatang")){
        title = $("#thread_subject").text();
    }

    
    if (title.includes("人人")) {
        title = $("#subject_tpc").text();
        dir = Array.from($("#breadCrumb a"))[2];
        console.log($(dir).text());
    }
    
    if (current_url.includes('xiuren222')){
        title = $('h1').text();
    }

    let previewPopup = new PreviewPopup("miner-preview-popup", title);
    previewPopup.create();

    let black_urls = await getBlackUrls();

    function includes_black_urls(url){
        let includes = false;

        for (const black_url of black_urls) {
            if (url.includes(black_url)){
                includes = true;
                break;
            }
        }

        return includes;
    }

    function addUrl(url){
        if (url && isPic(url)){
            if (isRelativePath(url)) url = getAbsoluteUrl(url);
               if (url && !includes_black_urls(url) && urls.indexOf(url) === -1){
                   previewPopup.write_line(url);
                   urls.push(url);
               }
        }
    }
    
    if(current_url.includes('sehuatang')){
        Array.from(imgs).forEach(img => addUrl($(img).attr('zoomfile')));
    }else{
        Array.from(imgs).forEach(img => addUrl($(img).attr('src')));
        Array.from(links).forEach(link => addUrl($(link).attr('href')));
        Array.from(links).forEach(link => addUrl($(link).attr('rel')));
        Array.from(imgs).forEach(img => addUrl($(img).attr('data-original')));
    }
}

async function analysis(menuId) {
    let url = window.location.href;

    let downloader = new Downloader()
    downloader.set(getMiner(url));

    popup.create();
    popup.show();
    popup.isCanBeSelect(content => content instanceof BaseFileInfo);
    popup.isDefaultSelected(content => content instanceof FileInfo);
    popup.download(async(lines) => await downloader.download(lines));
    await popup.write(async() => await downloader.get());
}

async function clean_up(){
    let cleanupPopup = new CleanUpPopup("miner-clean-up-popup", "清洁工");
    cleanupPopup.create();
}

async function clean_up_sign(tabId, bookmark){
    let item = eval(bookmark)[0];

    let hashCode = item.url.hashCode();
    let checkbox = $("input[type='checkbox'][hashCode='" + hashCode + "']");
    let titleDiv = $("div[hashCode='" + hashCode + "'] div:last-child");

    checkbox.focus();
    titleDiv.html(item.title);
    titleDiv.css("text-decoration", "line-through");
}

async function sign(tabId, fileItem){
    let item = eval(fileItem)[0];
    console.log({tabId, item});
    let hashCode = item.url.hashCode();
    popup.sign(hashCode, item.state === "complete");
}

function getMiner(url){
    let result = new BaseExcavator(url);

    let settings = [
        {
            name: "jpmnb",
            miner: () => new JpmnbExcavator(url)
        },{
            name: "xiannvku",
            miner: () => new XiannvkuExcavator(url)
        },{
            name: "xiuren01",
            miner: () => new XiurenbaExcavator(url)
        },{
            name: "xrmn01",
            miner: () => new Xrmn01Excavator(url)
        },{
            name: "javhoo",
            miner: () => new JavhooResolver(url)
        },{
            name: "javdb",
            miner: () => new JavdbResolver(url)
        },{
            name: "sehuatang",
            miner: () => new SehuatangExcavator(url)
        },{
            name: "hpzl1",
            miner: () => new SehuatangExcavator(url)
        },{
            name: "gmd9999",
            miner: () => new Gmd9999Excavator(url)
        },{
            name: "1kdj5",
            miner: () => new SehuatangExcavator(url)
        },{
            name: "sis001",
            miner: () => new Sis001Excavator(url)
        }
    ]
    
    for(const setting of settings){
        if (url.includes(setting.name)){
            result = setting.miner();
            break;
        }
    }

    return result;
}

function setTestXa360scmCookie(){
    let currentUrl = window.location.href;
    if (currentUrl.includes("https://testxa.360scm.com/")
        || currentUrl.includes("https://testxaoracle.360scm.com/")){
        let cookies = [
            {"Key": "SSID", "Value": localStorage.getItem("SSID")},
            {"Key": "Token", "Value": localStorage.getItem("Token")},
        ];

        console.log(cookies);

        $.ajax({
            type: "post",
            dataType: "json",
            url: "http://172.16.100.43/SCM.Developer.Apis/cookie",
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(cookies),
            success: function (data) {
                console.log(data);
            }
        });
    }
}

function jav114Link(){
    let url = window.location.href;
    if (url.includes('141jav.com')){
        $("body").on({
            click: function(e) {
                let element = $(e.currentTarget);
                let keyword = element.text().trim();
                let href = element.attr('href');
                
                if(keyword) sendMessage("searchKeyword", 0, {keyword: keyword, url:url}, () => {});
                if(keyword && href && href.includes("torrent")) element.removeAttr('href');
            }
        }, "a");
    }

    if (url.includes('javdb.com/v/')){
        var element = $('h2 strong')[0];
        if (element){
            var id = element.innerText.trim().replace("-", "");
            console.log(id);

            $(element).css("cursor", "pointer")
                      .css("color", "blue")
                      .css("text-decoration", "underline");
        
            $(element).click(() => {
                url = "https://www.141jav.com/search/" + id;
                sendMessage("openUrl", 0, {url: url});  
            })
        }
    }
}

function searchShortcutKey(){
    $(document).keydown(function(event) {
        if (event.altKey && event.shiftKey && event.keyCode === 80) {
            let locationUrl = window.location.href;
            let keyword = window.getSelection().toString();
            sendMessage("searchKeyword", 0, {keyword: keyword, url:locationUrl}, () => {});
        }else if (event.altKey && event.keyCode === 68){
            let locationUrl = window.location.href;
            sendMessage("bookmark", 1, locationUrl);
        }
    });
}

function preViewShortcutKey(){
    $(document).keydown(async function(event) {
        if (event.shiftKey && event.keyCode === 86) {
            await excavate();
        }
    });
}

function jypcLink(){
    let mainUrl = window.location.href;
    if (mainUrl.includes('jypc1.com')){
        let domain = new URL(mainUrl);
        let domainUrl = domain.origin;

        console.log(domainUrl);
        let links = $("div[class='C-InfoCard G-Field']");
        Array.from(links).forEach(link => {
            let url = null;
            let current = $(link);
            let titleElement = current.find('.Title');
            let title = titleElement.text();
            let clickEvent = current.attr("onclick");
            let id = current.parent().attr("data-id");

            if (id) url = domainUrl + "/" + id + ".html";
            else url = clickEvent.replace("location.href=", "")
                                 .replace("'","")
                                 .replace("'","");

            //url = getAbsoluteUrlByHref(url);
            titleElement.click(e => {
                console.log(url);
                sendMessage("openUrl", "", {
                    url: url
                }, response => {});
                e.stopPropagation();
            })
        });
    }
}

(function load(){
    searchShortcutKey();
    preViewShortcutKey();
    setTestXa360scmCookie();
    jav114Link();
    jypcLink();
})();