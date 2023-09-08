chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let popup = new Popup("miner", "矿工");

async function excavate(){
    const imgs = $(document.body).find("img");
    const links = $(document.body).find("a");

    let urls = [];

    let previewPopup = new PreviewPopup("miner-preview-popup", "清洁工");
    previewPopup.create();
    function addUrl(url){
        if (url && isPic(url)){
            if (isRelativePath(url)) url = getAbsoluteUrl(url);
               if (url && urls.indexOf(url) === -1){
                   previewPopup.write_line(url);
                   urls.push(url);
               }
        }
    }

    Array.from(imgs).forEach(img => addUrl($(img).attr('src')));
    Array.from(links).forEach(link => addUrl($(link).attr('href')));
    Array.from(links).forEach(link => addUrl($(link).attr('rel')));
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
    //console.log(item);

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
        },
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
    if (currentUrl.includes("https://testxa.360scm.com/")){
        let cookies = [
            {"Key": "SSID", "Value": localStorage.getItem("SSID")},
            {"Key": "Token", "Value": localStorage.getItem("Token")},
        ];

        console.log(cookies);

        $.ajax({
            type: "post",
            dataType: "json",
            url: "http://localhost/SCM.Developer.Apis/cookie",
            contentType: "application/json;charset=UTF-8",
            data: JSON.stringify(cookies),
            success: function (data) {
                console.log(data);
            }
        });
    }
}

function replaceDmsRequest(){
    let url = window.location.href;
    let replaced = false;
    if (url.includes('dms.360scm.com')){
        $('body').click(() => {
            if (replaced) return;
            replaced = true;

            let control = $('.easyui-tabs, .tabs-container');

            let newContext = control.html().replace(/(RQ\d+)/g, word => {
                return '<a target="_blank" href="https://dms.360scm.com/dms/dev/dev_view_rq.html?menuid=119&reqid=' + word + '">' + word + '</a>';
            });

            newContext = newContext.replace(/(MP\d+)/g, word => {
                return '<a target="_blank" href="https://dms.360scm.com/dms/cs/cs_view_malfunction.html?malfunction_id=' + word + '">' + word + '</a>';
            });

            control.html(newContext);
        });
    }
}

(function load(){
    setTestXa360scmCookie();
    //replaceDmsRequest
})();