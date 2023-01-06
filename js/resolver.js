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
        return "RQ220915023";
    }
    getTitle() {
        return "土方小挖：E区货到人拣选出库";
    }
    getCover() {
        return "base getCover";
    }
    getStills() {
        return [
            "包装层级EA，储区代码：E，货位用途：件拣货位",
            "跟踪LPN号，生成WCS任务",
            "订单补货、整包装补货、满足订单，生成WCS任务",
            "更新对应容器编号状态为“拣货中”",
            "将查询到的料车号记录到对应出库单“车号”字段",
            "生成开放状态出库容器（容器主表托盘号字段记录：料车号，容器主表UDF18记录“料车”）</",
            "调用标准接口RQ220725037创建WCS设备任务：呼叫料车前往合盘区（E-XN-03-02）",
            "将来源容器完整合托到料车上，删除来源容器明细，保留容器主信息"
        ];
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
        else
            this.resolver = new BaseResolver(this.url);
    }
    async get() {
        return await this.resolver.getContent();
    }
}