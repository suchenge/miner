chrome.runtime.onMessage.addListener(async (request, sender, callback) => {
    console.log({method: "main listener", request: request, callback: callback})

    callback({method:"main listener callback", request});
});

let popup = new Popup("miner", "矿工");
popup.create();

async function sign(itemString){
    let item = eval(itemString);
    popup.sign(item[0].url.hashCode());
}
async function analysis(menuId) {
    popup.show();

    let donwloader = new Downloader();
    let url = window.location.href;

    if(!url.includes("jpmnb.net")){
        donwloader.set(new Resolver(url));
    }else{
        donwloader.set(new Excavator(url));
    }
    
    popup.setDownloadEvent(async () => await donwloader.download());
    popup.write(async () => await donwloader.get());
}