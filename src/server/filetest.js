//流式读取占用的内存空间小，适合大文件处理
//比如读取大文件时，一次性读取到内存中可能会导致内存溢出，而使用流式读取可以分块处理数据，节省内存空间。
//读取64kb，然后写入128kb
// 流式写入时，写入速度可能跟不上读取速度，导致内存占用增加。
// 解决方法是使用流的背压机制（backpressure），确保写入操作不会超过读取操作的速度。
// 通过监听 'drain' 事件，可以在写入缓冲区清空后继续写入数据，从而控制内存使用。
//但是不论怎么样，占用的内存空间还是比一次性读取要小很多

// ws.write() 不返回 Promise：Node.js 原生流的 write 方法返回的是一个布尔值（表示缓冲区是否已满），而不是 Promise。
// 对一个非 Promise 值使用 await 会立即返回该值。
// data 事件不等待异步回调：Readable 流在触发 data 事件时，不会等待回调函数中的异步操作完成，它会连续不断地触发事件，这会导致背压（backpressure）问题。

console.log("this is file test");
let fs = require("fs");
let process = require("process");
// fs.createReadStream('src/server/filetest.js').pipe(fs.createWriteStream('src/server/filetest_copy.js'));
const data = fs.createReadStream(
  "../server/files/屏幕截图 2025-12-08 182152.png",
);

let ws = fs.createWriteStream("../server/files/mycopy.png");

data.on("data", (chunk) => {
  ws.write(chunk);
});
console.log(process.memoryUsage());

//2. 用的少
// data.pipe(ws); //方法用于将一个可读流（Readable Stream）连接到一个可写流（Writable Stream），

//3. ...existing code...
const { pipeline } = require("stream/promises");

async function copyFile() {
  try {
    await pipeline(data, ws);
    console.log("复制完成");
  } catch (err) {
    console.error("复制失败", err);
  }
}

// copyFile();
// ...existing code...

fs.readdir("./files", (err, data) => {
  if (err) {
    console.log("读取文件失败", err);
  } else {
    console.log("读取文件成功", data);
  }
});
