module.paths.push("C:\\Users\\user\\AppData\\Roaming\\npm\\node_modules");
const child = require("child_process");
const iconv = require("iconv-lite");
const http = require("http");
const url = require("url");

var server = http.createServer(async (request, response) => {
    console.log(request.url);
    var arg = url.parse(request.url, true).query;
    console.log(arg);


    if (request.url.includes("/search?id")) {
        response.writeHead(200, { "Content-Type": "application/json" });
        let esResponse = child.execSync(`D:\\my-project\\everything-command-line\\es.exe ${arg.id}`);
        esResponse = await iconv.decode(esResponse, "gbk");
        let responseLines = esResponse.split("\n");
        let responseObject = [];
        responseLines.forEach(line => {
            responseObject.push(line);
        });
        response.write(JSON.stringify(responseLines));
    }

    response.end();
}).listen(1987, "localhost");


