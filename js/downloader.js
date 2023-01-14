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
        console.log(this.content);
        return this.content;
    }

    async download(line) {
        let file = line.content;
        if (file instanceof BaseFileInfo && line.state === "selected") {
            sendMessage("download", file.hashCode, {
                url: file.url,
                filename: file.path,
                method: "GET",
                conflictAction: "overwrite",
                saveAs: false,
            }, response => {
            },500);
        }
    }
}