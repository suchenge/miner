class BaseResolver {
    constructor(url) {
        this.url = url;
        this.htmlContent = null;
    }
    async get() {
        let response = await request(this.url);
        if (response) {
            this.htmlContent = $(response);

            let id = this.getId().trim();
            let title = this.getTitle().trim();
            let cover = this.getCover();
            let stills = this.getStills();
            let torrents = this.getTorrents();
            let path = id + " " + title;

            return {
                id: id,
                title: title,
                cover: new FileInfo(cover, path, -1, file => id),
                stills: FileInfo.getFiles(stills, path, file => id + "_" + file.index),
                torrents: TorrentInfo.getFiles(torrents, path, file => id + "_" + file.index),
                path: path
            };
        }
        return null;
    }
    getId() {
        return $("title").text();
    }
    getTitle() {
        return $("title").text();
    }
    getCover() {
        return $("link[rel$='icon']").attr("href");
    }
    getStills() {
        let result = [];

        let index = 0;
        for(const img of $("img")) {
            let src = $(img).attr("src");
            if (src){
                index++;
                result.push($(img).attr("src"));
            if (index > 10) break;
            }
        }

        return result;
    }
    getTorrents() {
        return [];
    }
}

class JavdbResolver extends BaseResolver {
    constructor(url) {
        super(url);
    }
    getId() {
        let id = this.htmlContent.find("a[title='複製番號']").attr("data-clipboard-text");
        return id.toUpperCase();
    }
    getTitle() {
        let title = this.htmlContent.find("span[class='origin-title']").text();
        if (!title) {
            title = this.htmlContent.find("strong[class='current-title']").text();
        }
        return title;
    }
    getCover() {
        return this.htmlContent.find("img[class='video-cover']").attr("src");
    }
    getStills() {
        let result = [];
        let imgs = this.htmlContent.find("a[data-fancybox='gallery'][class='tile-item']");
        for (const img of imgs) {
            let href = $(img).attr("href");
            if (href !== "#preview-video")
                result.push(href.trim());
        }
        return result;
    }
    getTorrents() {
        let result = [];
        let magentElements = this.htmlContent.find("#magnets-content").children();

        for(const magent of magentElements){
            let magentConent = {
                link: $(magent).find("a").attr("href"),
                size: $(magent).find("span[class='meta']").text().trim(),
                date: $(magent).find("span[class='time']").text().trim(),
                name: $(magent).find("span[class='name']").text().trim(),
            }
            result.push(magentConent);
        }

        return result;
    }
}

class JavhooResolver extends BaseResolver {
    constructor(url) {
        super(url);
    }
    getId() {
        let id = this.htmlContent.find("span[class='categories']").text();
        return id.toUpperCase();
    }
    getTitle() {
        let id = this.getId();
        let title = this.htmlContent.find("h1[class='article-title']").text()
        return title.replace(id, "").trim();
    }
    getCover() {
        return this.htmlContent.find("img[class='alignnone size-full']").attr("src");
    }
    getStills() {
        let result = [];
        let imgs = this.htmlContent.find("a[class='dt-mfp-item']");
        for (const img of imgs) {
            let href = $(img).attr("href");
            if (href !== "#preview-video")
                result.push(href.trim());
        }
        return result;
    }
    getTorrents() {
        let result = [];
        let magentElements = this.htmlContent.find("#comments").find("tbody").last().find("tr");

        for(const magent of magentElements){
            let magentConent = {
                link: $(magent).find("td").eq(0).find("a").attr("href"),
                size: $(magent).find("td").eq(1).find("a").text().trim(),
                date: $(magent).find("td").eq(2).find("a").text().trim(),
                name: $(magent).find("td").eq(0).find("a").text().trim(),
            }
            result.push(magentConent);
        }

        return result;
    }
}