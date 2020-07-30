#!/usr/bin/env node
const xlsx = require("node-xlsx").default;
const path = require("path");
const fs = require("fs");
const dirName = "builds";
const argsPath = process.argv[2] ? process.argv[2].replace(/\\/g, "/") : "./";
const copyPath = path.resolve(argsPath, `./${dirName}`);
function copy(src, dst) {
  // 读取目录中的所有文件/目录
  // console.log("辅助", src);
  const paths = fs.readdirSync(src);
  paths.forEach(function (item) {
    var _src = src + "/" + item,
      _dst = dst + "/" + item,
      readable,
      writable;
    const st = fs.statSync(_src);
    if (st.isFile()) {
      // 创建读取流
      readable = fs.createReadStream(_src);
      // 创建写入流
      writable = fs.createWriteStream(path.resolve(argsPath, `./${_dst}`));
      // 通过管道来传输流
      readable.pipe(writable);
    }
    // 如果是目录则递归调用自身
    else if (st.isDirectory()) {
      exists(_src, _dst, copy);
    }
  });
}
// 在复制目录前需要判断该目录是否存在，不存在需要先创建目录
function exists(src, dst, callback) {
  const exists = fs.existsSync(dst);
  // 已存在
  if (exists) {
    callback(src, dst);
  }
  // 不存在
  else {
    if (src.includes("node_modules") || src.includes(dirName)) {
    } else {
      fs.mkdirSync(path.resolve(argsPath, `./${dst}`));
      callback(src, dst);
    }
  }
}
function isBuildDir() {
  if (fs.existsSync(copyPath)) {
    console.log("删除目录");
    fs.rmdirSync(copyPath, { recursive: true });
  }
}
function dirLoop(paths) {
  const files = fs.readdirSync(paths);
  files.forEach((item) => {
    let fPath = path.join(paths, item);
    let stat = fs.statSync(fPath);
    if (stat.isDirectory() === true) {
      dirLoop(fPath);
    }
    if (stat.isFile() === true) {
      isXlsx(fPath, item);
    }
  });
}
function isXlsx(paths, item) {
  if (item.endsWith(".xlsx") || item.endsWith(".xls")) {
    const fPath = paths;
    const fName = paths.split(".");
    const workSheetsFromBuffer = xlsx.parse(fs.readFileSync(fPath));
    var buffer = xlsx.build(workSheetsFromBuffer);
    fs.writeFileSync(paths, buffer);
  }
}
isBuildDir();
exists(argsPath, dirName, copy);
console.log("创建副本完成，准备去格式化 biu~biu");
setTimeout(() => {
  dirLoop(copyPath);
  console.log("完成");
}, 1000);
