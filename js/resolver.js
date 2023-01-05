class BaseResolver {
    constructor(url) {
        this.url = url;
        this.htmlContent = null;
    }
    async getContent() {
        let response = await request(this.url);
        if (response) {
            this.htmlContent = $(response);

            let id = this.getId();
            let title = this.getTitle();
            let cover = this.getCover();
            let stills = this.getStills();
            let torrents = this.getTorrents();
            let path = id + " " + title;

            return {
                id: id.trim(),
                title: title.trim(),
                cover: cover.trim(),
                stills: stills,
                torrents: torrents,
                path: path.trim()
            };
        }
        return null;
    }
    getId() {

    }
    getTitle() {

    }
    getCover() {

    }
    getStills() {

    }
    getTorrents() {

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
        if (!title){
            title = this.htmlContent.find("strong[class='current-title']").text();
        }
        return title;
    }
    getCover() {
        return this.htmlContent.find("img[class='video-cover']").attr("src");
    }
    getStills() {
        let result = [];
        let imgs = this.htmlContent.find("a[data-fancybox='gallery']");
        for (const img of imgs) {
            let href = $(img).attr("href");
            if (href != "#preview-video")
                result.push(href.trim());
        }
        return result;
    }
    getTorrents() {

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
            if (href != "#preview-video")
                result.push(href.trim());
        }
        return result;
    }
    getTorrents() {

    }
}

class Resolver {
    constructor(url) {
        this.url = url;
        this.resolver = null;

        if (this.url.includes("javdb.com"))
            this.resolver = new JavdbResolver(this.url);
        else if (this.url.includes("javhoo.org"))
            this.resolver = new JavhooResolver(this.url);
    }
    async get(){
        return await this.resolver.getContent();
    }
}