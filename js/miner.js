class Miner {
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
    async download(sender) {
        let downloadInfos = [];
        if (this.content.cover)
            downloadInfos.push(buildDownloadInfo(this.content.cover, buildFileInfo(this.content.cover, this.content.id, -1), this.content.path));

        if (this.content.stills
            && this.content.stills instanceof Array
            && this.content.stills.length > 0) {
            this.content.stills.forEach(async (still, index) => {
                downloadInfos.push(buildDownloadInfo(still, buildFileInfo(still, this.content.id, index), this.content.path));
            });
        }

        if (downloadInfos.length > 0) {
            for (const downloadInfo of downloadInfos) {
                sendDownloadMessage(downloadInfo, (request) => {
                    $("#miner-" + request.id).addClass("line-before");
                })
            }
        }
    }
}