# 实验4  hadoop常用命令使用
> 前言：hadoop是大数据的主要技术套件，其中包含了hdfs、MapReduce等，这在业界普遍使用，很多商业的大数据软件也是基于此开源软件的基础上，进行自定义开发的，所以作为大数据专业的同学Hadoop是必知必会的软件。

## 〖实验性质〗

验证型

## 〖实验目的〗

1、掌握Hadoop常用命令

2、掌握Hdfs常用命令

## 〖实验环境及工具〗

1、JDK 1.8

2、Hadoop-2.7.4

## 〖实验内容〗
### 一、Hadoop常用命令

#### 1.1、常见基础命令

1.1.1启动Hadoop

(1)进入HADOOP_HOME目录

(2)执行sh bin/start-all.sh

1.1.2关闭Hadoop

(1)进入HADOOP_HOME目录

(2)执行sh bin/stop-all.sh

(3) 将Hadoop安装路径加入到 环境变量

gedit ~/.bashrc

export HADOOP_HOME=/home/hadoop/Downloads/hadoop-2.7.1/

export PATH=${HADOOP_HOME}/bin:${JAVA_HOME}/bin:${SCALA_HOME}/bin:${HIVE_HOME}/bin:${PATH}

1.1.3查看指定目录下内容

hdfs fs -ls [file_path]

eg:hdfs fs -ls /user/hadoop/test.dat

1.1.4打开某个存在的文件

hdfs dfs -cat [file_path]

eg: hdfs dfs -cat /user/hadoop/test.dat

1.1.5将本地文件储存至Hadoop

hdfs fs -put [本地目录] [hadoop文件目录]

eg: hdfs fs -put /user/hadoop/test.dat /user/data

1.1.6将本地文件夹储存至Hadoop

hdfs fs -put [本地目录] [hadoop文件夹目录]

eg: hdfs fs -put /user/hadoop/test /user/data  (test是文件夹名)

1.1.7将hadoop上某个文件down至本地已有目录下

hdfs fs -get [hadoop文件目录] [本地目录]

eg: hdfs fs -get /user/data/test.txt /user/hadoop

1.1.8删除hadoop上指定文件

hdfs fs -rm [hadoop文件路径]

eg: hdfs fs -rm /user/data/test.txt

1.1.9删除hadoop上指定文件夹（包含子目录等）

hdfs fs -rm [hadoop文件夹路径]

eg: hdfs fs -rm /user/data/test

1.1.10在hadoop指定目录内创建新目录

hdfs fs -mkdir [hadoop目标目录]

eg: hdfs fs -mkdir /user/data/test

1.1.11在hadoop指定目录下创建一个空文件

hdfs fs -touchz [文件名]

eg: hdfs fs -touchz /user/data/test.txt

1.1.12将hadoop上某个文件重命名

hdfs dfs -mv [文件名] [新文件名]

eg: hdfs dfs –mv /user/data/test.txt /user/data/test_new.txt

1.1.13将hadoop上指定目录下所有内容保存一个文件并下载到本地

hdfs dfs -getmerge [文件]

eg: hdfs dfs -getmerge /user/data/test

1.1.14将正在运行的hadoop作业kill

hadoop job -kill [job_id]

eg: hadoop job -kill 277896

1.2、详细命令

1.2.1启动hadoop所有进程

start-all.sh 等价于start-dfs.sh+start-yarn.sh

说明：一般不推荐使用start-all.sh(开源框架中内部命令启动很多问题)

1.2.2单进程启动

sbin/start-dfs.sh

sbin/hadoop-daemons.sh –config .. –hostname .. start namenode…

sbin/hadoop-daemons.sh –config .. –hostname .. start datanode…

sbin/hadoop-daemons.sh –config .. –hostname .. start sescondarynamenode…

sbin/hadoop-daemons.sh –config .. –hostname .. start zkfc…//

start-yarn.sh

libexec/yarn-config.sh

sbin/yarn-daemon.sh –config $YARN_CONF_DIR start resourcemanager

sbin/yarn-daemons.sh –config $YARN_CONF_DIR start nodemanager

1.3、常用命令

1.3.1 查看指定目录下内容

hdfs dfs -ls [file_path]

hdfs dfs -ls -R / --显示目录结构

eg:hdfs dfs -ls /user/hadoop/

1.3.2 打开某个已存在文件

hdfs dfs -cat [file_path]

eg: hdfs dfs -cat /user/hadoop/test.dat

1.3.3将本地文件存储至hadoop

hdfs dfs -put [本地目录] [hadoop文件目录]

eg: hdfs dfs -put /user/hadoop/test.txt /user/data

1.3.4将本地文件夹存储至hadoop

hdfs dfs -put [本地目录] [hadoop文件夹目录]

eg: hdfs dfs -put /user/hadoop/test /user/data  (test是文件夹名)

1.3.5将hadoop上某个文件down至本地已有目录下

hdfs dfs -get [hadoop文件目录] [本地目录]

eg: hdfs dfs -get /user/data/test.txt /user/hadoop

1.3.6删除hadoop上指定文件

hdfs dfs -rm [hadoop文件路径]

eg: hdfs dfs -rm /user/data/test.txt

1.3.7删除hadoop上指定文件夹（包含子目录等）

hdfs dfs -rm [hadoop文件夹路径]

eg: hdfs dfs -rm /user/data/test

1.3.8在hadoop指定目录内创建新目录

hdfs dfs -mkdir [hadoop目标目录]

eg: hdfs dfs -mkdir -p /user/data/test

1.3.9 hadoop指定目录下创建一个空文件

hdfs dfs -touchz [文件名]

eg: hdfs dfs -touchz /user/data/test.txt

1.3.10将hadoop上某个文件重命名

hdfs dfs -mv [文件名] [新文件名]

eg: hdfs dfs –mv /user/data/test.txt /user/data/test_new.txt

1.3.11将hadoop上指定目录下所有内容保存成一个文件并下载到本地

hdfs dfs -getmerge [文件]

eg: hdfs dfs -getmerge /user/data/test

1.3.12将正在运行的hadoop作业kill

hadoop job -kill [job_id]

eg: hadoop job -kill 277896

1.3.13查看帮助

hdfs dfs -help

1.3.14查看最后1kb内容

hdfs dfs -tail [文件名]

eg: hdfs dfs -tail /usr/data/test.txt

1.3.15从本地复制文件到hadoop上(同-put)

hdfs dfs -copyFromLocal [文件名] [Hadoop文件目录]

eg: hdfs dfs - copyFromLocal test.txt /usr/data/test.txt

1.3.16从hadoop复制文件到本地(同-get)

hdfs dfs -copyToLocal [Hadoop文件目录] [文件名]

eg: hdfs dfs - copyToLocal /usr/data/test.txt test.txt

## 〖课后实验作业〗

（1）在用户Hadoop的根目录下创建1个目录名为 test的文件目录。

（2）在本地路径下，创建1个文件cur_pwd.txt，文件内容是 当前路径的地址。

（3）在本地路径下，再创建1个文件hi.txt，文件内容是 你的学号和姓名，用空格分开。

（4）查看本地目录下是否有这2个文件。

（5）分别查看 这2个文件的内容。

（6）将这2个文件都上传到 第1步创建目录下。

（7）分别查看对这2个文件的内容。

