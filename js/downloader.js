class Downloader {
    constructor() {
        this.content = null;
        this.executor = null;
        this.downloadList = [];
    }

    set(executor) {
        this.executor = executor;
    }

    async get() {
        if (this.content) return this.content;

        this.content = await this.executor.get();
        console.log(this.content);
        return this.content;
    }

    getFiles(){
        let files = [];
        let torrents = [];

        let getFileInfo = function (obj){
            if (obj instanceof FileInfo
                && obj.url
                && obj.url.startsWith("http")
                && !obj.uri.startsWith("chrome-extension")
                && ["jpg", "png", "jpeg"].includes(obj.type))
                files.push(obj.get());

            if (obj instanceof TorrentInfo)
                torrents.push(obj);
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

        return {files, torrents};
    }

    async download(sender) {
        this.downloadList = this.getFiles();

        let files = this.downloadList.files;
        let torrents = this.downloadList.torrents;

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

        let newTorrents = [];
        for(const torrent of torrents){
            if (sender.matchLine(torrent.hashCode())) newTorrents.push(torrent);
        }

        for(const torrent of newTorrents){
            sendMessage("download", torrent.index, {
                url: torrent.url,
                filename: torrent.path,
                method: "GET",
                conflictAction: 'overwrite',
                saveAs: false
            }, (response) => {
                //$("#miner-" + response.id).addClass("line-before");
                //console.log({method: "download response", response: response});
            });
        }
    }
    getMatchedFileHashCode(url){

        let file = this.downloadList.files.filter(item => item.url == url);
        if (!file || file.length == 0) file = this.downloadList.torrents.filter(item => item.url == url);

        return file[0].url.hashCode();
    }
}