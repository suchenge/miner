chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let popup = new Popup("miner", "矿工");

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

(function load(){
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
})();