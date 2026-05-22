# 实验12  node.js安装与使用

>前言：Node.js 是一种开源、跨平台的运行环境和库，用于在客户端浏览器之外运行网络应用程序。它用于服务器端编程，主要部署在非阻塞、事件驱动的服务器上，如传统网站和后端 API 服务，但最初设计时考虑到了实时、基于推送的架构。每个浏览器都有自己版本的 JS 引擎，而 node.js 就是基于 Google Chrome 浏览器的 V8 JavaScript 引擎构建的。本案例采用网页可视化呈现电影推荐结果，并使用Nodejs 开发网页应用程序，因此，本章内容将介绍Nodejs 的安装和使用方法。为了快速学习Nodejs, 这里将通过1个具体实例详绍进解 Nodejs 搭建网站的过程。

## 〖实验性质〗

验证型

## 〖实验目的〗

1、了解什么node.js

2、node.js 安装

3、node.js 搭建简单后端服务

## 〖实验环境及工具〗

1、linux

2、node.js

## 〖实验内容〗

### 一、前置准备

1．进入linux， 点击 右键-Open in Terminal 。

### 二、node.js 安装

1．下载并安装wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash

验证是否成功：npm -v  

2．使用vim编辑器打开文件“~/.bashrc”。  

sudo vim -/.bashrc

在该文件的开头位置添加NVM DR环境变量

export MVM_DIR="sHOME/,nvm"

[ -s  "SNWN_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

3．保存文件并退出vim编辑器。然后，在终端中输人如下命令使得上面的设置立即生效。 

source  ~/.bashrc

4．完成NVM的安装以后，就可以使用NVM安装NodejsLTS(长期支持版本),命令如下。 

nvm install --1ts

5．安装完成后，在终端中输入如下命令即可看到安装成功的Nodesjs的版本信息。 

 node -v

### 三、node.js搭建简单后端服务

可以使用htpcreateServer(方法创建服务器，并使用listen方法绑定3000端口(端口号可以 自由设置，只要这个端口号没有被占用即可，比如端口号为3001)。函数通过request和 response 参数来接收请求和发送响应数据。

打开Linux终端，在当前登录用户的主目录下，创建一个项目目录MyNodeApp,在项目的根目录下创建一个称为server.js的文件，具体命令如下。

1．cd ~

2．mkdir  mynodeapp

3．cd  mynodeapp

4．gedit server.js

进 入serverjs文件编辑状态以后，在该文件中添加以下代码。 
```javascript
var http = require('http');

http.createServer(function (requast,response){

//发送HTTP头部

//HTTP 状态值：200:0K //内容类型：text/plain

response,writeHead(200,{'Content-Type':'text/plain'});

//发送响应数据"Hello World"

response.end('Hello World\n');

}).listen(3000);

//终端打印如下信息

console.log('Server running at  http:// 127.0.0.1:3000/');
```

5．保存文件并退出vim编辑器,启动运行server.js 。

  Node server.js

6．在linux的浏览器中输入网址 http://127.0.0.1:3000 或 http://localhost:3000 

## 〖课后实验作业〗

在自己电脑上重复本实验所有实例案例和程序案例，理解本节内容。
