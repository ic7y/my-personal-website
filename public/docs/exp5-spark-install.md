# 实验5 Spark环境搭建

> 前言：Spark于2009年诞生于美国加州大学伯克利分校的AMP实验室，它是一个可应用于大规模数据处理的统一分析引擎。Spark不仅计算速度快，而且内置了丰富的API，使得我们能够更加容易编写程序。MapReduce和Spark都是做大数据分析处理的。MapReduce中间处理结果保存在硬盘中，侧重离线处理，Spark处理结果保存在内存中，侧重实时在线处理。
## 〖实验性质〗

验证型

## 〖实验目的〗

1、了解Spark的特点

2、掌握Spark集群的搭建和配置及架构

3、理解Spark作业提交的工作原理

4、掌握Spark HA集群的搭建和配置

## 〖实验环境及工具〗

1、Standalone模式集群环境

2、spark local 、hadoop文件系统、Spark HA集群

## 〖实验内容〗

### 1. 环境准备

    由于Spark仅仅是一种计算框架，不负责数据的存储和管理，因此，通常都会将Spark和Hadoop进行统一部署，由Hadoop中的HDFS、HBase等组件负责数据的存储管理，Spark负责数据计算。

    安装Spark集群前，需要安装Hadoop环境，本教材采用如下配置环境。

    Linux系统：Ubuntu 22.04版本

    Hadoop：2.7.4版本

    JDK：1.8版本

    Spark：2.1.0版本

### 2. Spark的部署方式

Spark部署模式分为Local模式（本地单机模式），在Local模式下，常用于本地开发程序与测试，而集群模式又分为下面三种：

#### （1）Standalone模式

Standalone模式被称为集群单机模式。

该模式下，Spark集群架构为主从模式，即一台Master节点与多台Slave节点，Slave节点启动的进程名称为Worker，存在单点故障的问题。

#### （2）Mesos模式

Mesos模式被称为Spark on Mesos模式。

Mesos是一款资源调度管理系统，为Spark提供服务，由于Spark与Mesos存在密切的关系，因此在设计Spark框架时充分考虑到对Mesos的集成。

#### （3）Yarn模式

Yarn模式被称为Spark on Yarn模式，即把Spark作为一个客户端，将作业提交给Yarn服务。Yarn模式又分为Yarn Cluster模式和Yarn Client模式。

Yarn Cluster模式：用于生产环境，所有的资源调度和计算都在集群上进行。

Yarn Client模式：用于交互、调试环境。

由于在生产环境中，很多时候都要与Hadoop使用同一个集群，因此采用Yarn来管理资源调度，可以提高资源利用率。

### 3. Spark Local安装部署

#### （1）下载Spark安装包

     下载地址：http://spark.apache.org/downloads.hml

#### （2）安装spark
```shell
    mkdir ~/apps

    tar zxf  ~/Downloads/spark-2.1.0-bin-without-hadoop.tgz -C /home/hadoop/apps/

    cd ~/app
```
#### （3）配置spark
```shell
   cd ~/spark-2.1.0-bin-without-hadoop
   
   cp ./conf/spark-env.sh-temple ./conf/spark-env.sh

   用gedit 编辑spark-env.sh的内容
   
   gedit ./conf/spark-env.sh   
   
   在文件的第一行添加以下配置信息， 保存。
   
   export SPARK_DIST_CLASSPATH=$(/home/hadoop/Downloads/hadoop-2.7.1/bin/hadoop classpath)
   
   有了以上配置信息，spark就可以读写hadoop的hdfs中的数据，否则就只能读写本地数据。
```
#### （4）验证spark是否安装成功

    在spark的安装目录下，运行bin目录下样例中的可执行文件run-example 。
```shell   
 bin/run-example SparkPi    # 这里SparkPi 是该执行命令的参数
```
