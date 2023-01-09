class Downloader {
    constructor() {
        this.content = null;
        this.executor = null;
    }
    set(executor) {
        this.executor = executor;
    }
    async get() {
        if (this.content) return this.content;

        this.content = await this.executor.get();
        return this.content;
    }

    getFiles(){
        let files = [];

        let getFileInfo = function (obj){
            if (obj instanceof FileInfo
                && obj.url
                && obj.url.startsWith("http")
                && !obj.uri.startsWith("chrome-extension")
                && ["jpg", "png", "jpeg"].includes(obj.type))
                files.push(obj.get());
        };

        let getFileInfos = function (objs){
            objs.forEach(obj => getFileInfo(obj));
        };

        for (const contentKey in this.content) {
            let contentValue = this.content[contentKey];

            if (contentValue)
            {
                if (contentValue instanceof Array) getFileInfos(contentValue);
                else getFileInfo(contentValue);
            }
        }

        return files;
    }
    async download() {
        let files = this.getFiles();
        if (files.length > 0) {
            for (const file of files) {
                sendMessage("download", file.id, {
                    url: file.url,
                    filename: file.path,
                    method: "GET",
                    conflictAction: 'overwrite',
                    saveAs: false
                }, (response) => {
                    //$("#miner-" + response.id).addClass("line-before");
                    //console.log({method: "download response", response: response});
                });
            }
        }
    }
}