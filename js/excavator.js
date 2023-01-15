class BaseExcavator{
    constructor(url) {
        this.url = url;
    }
    async get(){
        let response = await request(this.url);
        let html = $(response);

        let title = this.getTitle(html);
        let stills = [];
        let currentPageStills = this.getStills(html);
        let otherPageUrls = this.getOtherPageUrls(html);

        if (currentPageStills && currentPageStills.length > 0){
            currentPageStills.forEach(still => stills.push(still));
        }

        if (otherPageUrls && otherPageUrls.length > 0){
            for(const url of otherPageUrls){
                let urlResponse = await request(url);
                let urlHtml = $(urlResponse);
                let urlStills = this.getStills(urlHtml);
                if (urlStills && urlStills.length > 0){
                    urlStills.forEach(still => stills.push(still));
                }
            }
        }
        return {
            title: title.trim(),
            stills: FileInfo.getFiles(stills, title, file => (file.index + "").padStart(5, "0")),
            path: title.trim()
        } 
    }
    getTitle(html){
        return "";
    }
    getStills(html){
        return [];
    }
    getOtherPageUrls(html){
        return [];
    }
}

class JpmnbExcavator extends BaseExcavator{
    constructor(url) {
        super(url);
    }
    sign(currentUrl, nextUrl){
        $("a[href='" + currentUrl + "']").removeAttr("class");
        $("a[href='" + nextUrl + "']").attr("class", "current");
    }
    getTitle(html){
        return html.find("h1[class='article-title']").text();
    }
    getStills(html){
        let stills = [];

        let imgElement = html.find("img[onload='size(this)']");
        if (imgElement) {
            for (const element of imgElement) {
                let src = $(element).attr("src");
                stills.push(src.trim());
            }
        }
        return stills;
    }
    getOtherPageUrls(html){
        let urls = [];

        let pagination = html.find("div[class='pagination1']").first();
        let pageLinks = $(pagination).find("a[class!='current']");

        if (pageLinks && pageLinks.length > 0){
            for(const link of pageLinks){
                let href = $(link).attr("href");
                if (!urls.includes(href)){
                    urls.push(href);
                }
            }
        }

        return urls;
    }
}

class XiannvkuExcavator extends BaseExcavator{
    constructor(url){
        super(url)
    }
    getTitle(html){
        return html.find("h1").text();
    }
    getStills(html){
        let stills = [];

        let imgElement = html.find("img[class='content_img']");
        if (imgElement) {
            for (const element of imgElement) {
                let src = $(element).attr("src");
                stills.push(src.trim());
            }
        }
        return stills;
    }
    getOtherPageUrls(html){
        let urls = [];
        let urlTemplate = this.url.replace("-1.html", "");

        let pageLinks = html.find("div[id='pages']").find("a");
        let maxPageLink = pageLinks.eq(pageLinks.length - 2);
        let maxPageCount = maxPageLink.text();
        for(let i = 2; i <= maxPageCount; i ++){
            urls.push(urlTemplate + "-" + i + ".html");
        }

        return urls;
    }
}

class XiurenbaExcavator extends BaseExcavator{
    constructor(url){
        super(url)
    }
    getTitle(html){
        return html.filter("meta[name='description']").attr("content");
    }
    getStills(html){
        let stills = [];
        let title = this.getTitle(html);

        let imgElement = html.find("img");
        if (imgElement) {
            for (const element of imgElement) {
                let alt = $(element).attr("alt")
                if (alt && alt.includes(title)){
                    let src = $(element).attr("src");
                    stills.push(src.trim());
                }
                
            }
        }
        return stills;
    }
    getOtherPageUrls(html){
        let urls = [];
        let pagination = html.find("div[class='page']").first();
        let pageLinks = $(pagination).find("a[class!='current']");

        if (pageLinks && pageLinks.length > 0){
            for(const link of pageLinks){
                let href = $(link).attr("href");
                if (href && !urls.includes(href)){
                    urls.push(href);
                }
            }
        }
        return urls;
    }
}

class Xrmn01Excavator extends BaseExcavator{
    constructor(url){
        super(url)
    }
    getTitle(html){
        return html.find("h1").text();
    }
    getStills(html){
        let stills = [];
        let title = this.getTitle(html);

        let imgElement = html.find("img");
        if (imgElement) {
            for (const element of imgElement) {
                let alt = $(element).attr("alt")
                if (alt && alt.includes(title)){
                    let src = $(element).attr("src");
                    stills.push(src.trim());
                }
                
            }
        }
        return stills;
    }
    getOtherPageUrls(html){
        let urls = [];
        let pagination = html.find("div[class='page']").first();
        let pageLinks = $(pagination).find("a[class!='current']");

        if (pageLinks && pageLinks.length > 0){
            for(const link of pageLinks){
                let href = $(link).attr("href");
                if (href && !urls.includes(href)){
                    urls.push(href);
                }
            }
        }
        return urls;
    }
}