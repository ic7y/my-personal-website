<style>
pre {
    overflow-y :auto;
    max-height : 500px;
}
</style>

# 0. node 的安装
```shelll
wget -qO- https://raw.githubusercontent.com/creationix/nvm/v0.33.8/install.sh | bash
```

# 1. 创建 node.js 的应用
```shell
mkdir -p ~/nodeapp/firstapp
cd ~/nodeapp/firstapp

gedit server.js
# 输入以下内容：
var http=require('http');
http.createServer(function(request,response){
	response.writeHead(200,{'Content-Type':'text/plain'}); // 写返回信息： 200，http: 返回状态码。 内容类型：text/plain
	response.end('hello world~\n')
}).listen(3000);
//终端 打印 访问地址。
console.log('Server running at http://127.0.0.1:3000/');

#保存退出编辑。
# 启动http 服务器。
node server.js     
# 点击 终端打出的链接  http://127.0.0.1:3000/ 。 在虚拟机的浏览器里可以查看网页内容。
```

# 2. 使用Express 和Jade 模版引擎
```shell
1. 创建项目及初始化
   mkdir -p nodeapp/expressApp
   cd nodeapp/expressApp
   npm init    # 不想输入，就一直 Enter 
2. 安装Express框架 和 Jade 模版
   npm install express --save 
   npm install jade --save 
   gedit expressjade.js	  # 创建并编辑内容如下：
   var express = require('express');
   var http = require('http');
   var app = express();
   app.set('view engine','jade'); // 设置模版引擎
   app.set('views', __dirname);   // 设置模版相对路径
   app.get('/',function(req, res) {
	// 调用当前路径下的test.jade模版
       res.render('test',{title:'Jade test',message:'Database lab of USY'});
} )
   
   var server = http.createServer(app)
   server.listen(3000)
   console.log('server started on htttp://127.0.0.1:3000/')
# 保存退出。
   gedit test.jade  # 创建并编辑如下内容：
html
 head
  title!=title
 body
  h1!=message 
# 保存退出

node expressjade.js

点击链接，可以看到网站。
如无法点击链接跳转。 
a.重开个 open-terminal。
b. firefox 
c. 在浏览器地址栏输入： 127.0.0.1:3000 
```
# 网站的登录
## 创建项目目录及开发框架安装
```shell
mkdir ~/userloginjadeapp
cd uerloginjadeapp
npm init
npm install express --save 
npm install jade --save
npm isntall mysql --save
npm install body-parser --save
```
## mysql 建用户注册表
```shell
service mysql start 
mysql -u root -p            // 密码 hadoop 
create database userlogin ;
use userlogin ;
create table user(userid int(20) not null auto_increment, username char(50), password char(50) , primary key(userid) ) ;
desc user ;
select * from user ;
```
## 创建服务器
```shell
gedit userloginjade.js  # 这个文件为整个网站应用的入口，编辑内容如下：

    /**
     * Created by linziyu on 2018/7/3.
     */
    /**
     * express接收html传递的参数
     */
     
    var  express=require('express');
    var  bodyParser = require('body-parser')
    var  app=express();
    var mysql=require('mysql');
    app.set('view engine', 'jade'); 
    app.set('views', __dirname);
    app.use(bodyParser.urlencoded({extended: false}))
    app.use(bodyParser.json())
     
    /**
     * 配置MySQL
     */
    var connection = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'root',
        password : 'hadoop',
        database : 'userlogin',
        port:'3306'
    });
    connection.connect();

   /**
     * 跳转到网站首页，也就是用户登录页面
     */
    app.get('/',function (req,res) {
        res.render('index');
    })
     
    /**
     * 实现登录验证功能
     */
    app.post('/login',function (req,res) {
        var  name=req.body.username.trim();
        var pwd=req.body.pwd.trim();
	console.log('username:'+name+'password:'+pwd);
     
        var selectSQL = "select * from user where username = '"+name+"' and password = '"+pwd+"'";
        connection.query(selectSQL,function (err,rs) {
            if (err) throw  err;
            console.log(rs);
            console.log('ok');
            res.render('ok',{title:'Welcome User',message:name});
        })
    })

    /**
     * 跳转到注册页面
     */     
    app.get('/registerpage',function (req,res) {
      res.render('registerpage',{title:'注册'});
    })
     
    /**
     * 实现注册功能
     */
    app.post('/register',function (req,res) {
        var  name=req.body.username.trim();
        var  pwd=req.body.pwd.trim();
        var  user={username:name,password:pwd};
        connection.query('insert into user set ?',user,function (err,rs) {
            if (err) throw  err;
            console.log('ok');
           res.render('ok',{title:'Welcome User',message:name});
        })
    })
     
     
     
     
    var  server=app.listen(3000,function () {
        console.log("userloginjade server start......");
    })

```
## 创建网页模版文件
### index.jade : 用户访问网站默认首页。
```shell
html
  head
    title!= title
  body
      
    form(action='/login', method='post')

      p 用户登录
      input(type='text',name='username')
      input(type='text',name='pwd')
      input(type='submit',value='登录')
      br
    a(href='/registerpage', title='注册') 注册
```
### registerpage.jade : 用户注册页面
```shell
html
  head
    title!= title
  body

    form(action='/register', method='post')

      p 用户注册
      input(type='text',name='username')
      input(type='text',name='pwd')
      input(type='submit',value='注册')      

```
### ok.jade : 成功登录的确认页面。
```shell
html
  head
    title!= title
  body
    h1 热烈欢迎用户: #{message}
```

bye~

