# 1. scala 安装
```shell
发给你们的压缩包scala-2.11.11.tgz 拷贝到 虚拟机的桌面。

打开控制台，右键-open terminal 

mv  Desktop/scala-2.11.11.tgz  /home/hadoop/Downloads/scala-2.11.11.tgz 
cd Downloads
tar -zxvf scala-2.11.11.tgz     # 解压缩到 当前目录下
sudo gedit  /etc/profile   # 最下部增加 如下内容
export SCALA_HOME=/home/hadoop/Downloads/scala-2.11.11  
PATH=${SCALA_HOME}/bin:$PATH

# 保存退出
source /etc/profile  # 使修改立马生效
```

# 2. sbt 安装
```shell 
echo "deb https://repo.scala-sbt.org/scalasbt/debian all main" | sudo tee /etc/apt/sources.list.d/sbt.list
echo "deb https://repo.scala-sbt.org/scalasbt/debian /" | sudo tee /etc/apt/sources.list.d/sbt_old.list
curl -sL "https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823" | sudo apt-key add  
# 如果上面一步报错 : no valid openpgp ....   
# 执行下面分支命令   
 	a) windows 浏览器打开 https://keyserver.ubuntu.com/pks/lookup?op=get&search=0x2EE0EA64E40A89B84B2DF73499E82A75642AC823 将打开内容 全选+复制。
	b) 在linux 环境里 gedit rsa.key  , 把内容粘贴在这个文件中，保存退出。
        c)  sudo apt-key add  rsa.key

sudo apt-get update
sudo apt-get install sbt

sbt -version  # 这里会下载很多安装包，等待安装完成就好。 过会再来看。


```
