# Node.js实现简单网页

> 前言：Node.js 是一种开源、跨平台的运行环境和库，用于在客户端浏览器之外运行网络应用程序。它用于服务器端编程，主要部署在非阻塞、事件驱动的服务器上，如传统网站和后端 API 服务，但最初设计时考虑到了实时、基于推送的架构。每个浏览器都有自己版本的 JS 引擎，而 node.js 就是基于 Google Chrome 浏览器的 V8 JavaScript 引擎构建的。本案例采用网页可视化呈现电影推荐结果，并使用Nodejs 开发网页应用程序，因此，本章内容将介绍Nodejs 的安装和使用方法。为了快速学习Nodejs, 这里将通过2个具体实例详绍进解 Nodejs 搭建网站的过程。

## 〖实验性质〗

验证型

## 〖实验目的〗

1、了解什么是node.js

2、node.js 实现简单网页

## 〖实验环境及工具〗

1、Linux

2、node.js

3、Mysql

## 〖实验内容〗

### 一、创建 MySQL数据库

在Linux终端中，使用如下命令进入MySQL Shell交互式执行环境。 

mysql -u root -p

按照系统提示输人MySQL数据库的root 用户的密码123456，然后进入MySQL Shll交互式执行境，在“”命令提示符后面输入如下命令创建数据库。

```mysql
1．create database  userlogin;
2．use   userlogin;
3．create  table  user (
userid   int(20) not  null  auto_increment,
username  char(50),
password  char(50),
primary   key(userid));
4．desc  user;
5．Select * fron user;
```

### 二、node.js 创建项目目录

在 Linux终端中，使用如下命令创建项目目录 userloginapp,并完成初始化。

```shell
cd ~
mkdir userloginapp 
cd userloginapp
npm init
npm set strict-ssl=false
npm config set registry https://registry.npm.taobao.org
```

备注：在输入初始化项目命令“npm init”后，终端会提示输入项目的相关信息，并自动把这些信息记录在packagejson中。如果想进行快捷开发，不想手动输入项目信息，则只需要一直按<Enter>  健，接受默认的自动配置即可。

### 三、安 装Express   开发框架
  
 在 Linux终端中继续输入如下命令来安装Expres开发框架。 

cd ~/userloginapp

npm  install  express  --save  

（save前面是两个英文短横线）

通过上面命令安装的模块，都会放在当前项目文件夹下的node modules文件夹下，并更新到 packagc.json文件中。Nodejs引用该模块的时候，会自动从node modules文件夹下寻找模块。

### 四、node.js搭建简单后端服务 安 装MySQL    驱动模块

为了让Nodejs能够顺利访问MySQL数据库，需要单独安装MySQL驱动模块，在Linux终 端中执行如下命令即可。

cd ~/userloginapp

 npm install mysql --save


### 五、创 建 服 务 器

在项目目录 userloginapp中，创建一个名为userlogin.js的文件。这个文件是整个网页应用的 人口，该文件的内容如下。
```javascript
/**
·express 接收HTML传递的参数
*/
var express=require('express') 
var app=express();
var mysql=require('mysql');
/**
· 配置MySQL
 */
var  connection = mysql.createConnection( {host :'127.0.0.1',
user :'root',
password:'123456', 
database:'userlogin',
port:'3306' });
connection.connect();

app.get('/',function (req,res){


res.sendfile(_dirname +"/"+"index.html");

})
/**
实现登录验证功能 
*/
app.get('/login',function(req,res){ 
var name=req.query,name
var pwd=req.query.pwd;
var selectSQL ="select * from user where username      ='"+name+"' and password ='"+pwd+"'";
connection.query(selectSQL,function (err,rs){
if  (err)  throw err;
console.log(rs);
console.log('OK');
            res.sendfile(_dirname+"/"+"ok.html");
          
})
})
app.get('/register.html',function (req,res){

res.sendfile(_dirname+"/"+"register.html");

})

/**
实现注册功能 
*/
app.get('/register',function (req,res) {
var  name=req.query.name;
var  pwd=req.guery.pwd;
var  user={username:name,password:pwd};
connection.query('insert into user set  ?',user,function      (err,rs) {
if  (err) throw   err; 
console.log('ok');
res.sendfile(_dirname +"/"+"index.html");
})
}) 
var  server=app.listen(3000,function(){

console.log("userlogin server starts...."); })

```

上面的代码用于启动一个HTTP服务器，并监听从3000端口进入的所有连接请求。

### 六、创建网页

现在创建3个网页，具体功能如下。

index.html: 用户访问网站后默认呈现的页面，提供了用户登录界面和注册页面链接。

register.html: 用户注册页面。

ok.html: 呈现成功登录的确认信息。

1.    index.html 网页代码
``` html
<!DOCTYPE html>   
<html lang="en"
<head>
<meta charset="UTF-8"> 
<title>Title</title>
</head>  
<body>
<form action="http:// 127.0.0.1:3000/1ogin"> UserName:<input type="text" name="name"/>   Password:<input type="text" name="pwd"/>
<input   type="submit" value="提交">
</form>
<p>
<a href="register.html">注册</a>
</body> 
</html>
```

2.register.html       网页代码

```html
<!DOCTYPE html>   
<html lang="en"> 
<head>
<meta charset="UTF-8">
<title>Title</title>
</head>  
<body>
<form  action="http:// 127.0.0.1:3000/register">
User Name:<input type="text"name="name"/>  Password:<input type="text"name="pwd"/>
<input type="submit"value="提交"/>
</form>
</body>    
</html>
```

3.ok.html       网页代码

```html

<!DOCTYPE html>  
<html lang="en">
 <head>
<meta  charset="UTF-8">
<title>Title</title> 
</head>
<body>
Login success!
</body>
</html>

```

### 七、测试网页

1．在linux终端中执行命令启动http服务器。

cd ~/userloginapp

node userlogin.js

2．在linux系统的浏览器地址栏，输入localhost:3000。观察网页是否正常显示。

## 〖课后实验作业〗

在自己电脑上重复本实验所有实例案例和程序案例，理解本节内容。
