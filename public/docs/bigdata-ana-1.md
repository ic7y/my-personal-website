#  项目大作业
## 0. 环境准备 
``` shell
1. 停止所有 docker镜像 
docker stop $(docker ps -aq)
2. gedit ~/.bashrc  修改环境变量
在文件最后增加以下内容：
export HIVE_HOME=/home/hadoop/Downloads/apache-hive-1.2.1-bin

export PATH=$JAVA_HOME/bin:$SCALA_HOME/bin:$HADOOP_HOME/bin:$HADOOP_HOME/sbin:$SPARK_HOME/bin:$SQOOP_HOME/bin:$HIVE_HOME/bin:$PATH

nohup hive --service metastore 2>&1 &

保存，退出。

source ~/.bashrc
3. 切换项目目录 
cd ~/myapp
4. 切换要使用的 版本
nvm use 18 

```
## 1. 启动程序

``` shell
node server.js

屏幕输出以下内容：Server running on port 3000
表示后台服务启动成功，浏览器打开链接 localhost:3000/login
进行注册登录即可进入 汽车经营分析系统。
```

