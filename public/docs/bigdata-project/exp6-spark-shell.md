# spark-shell 使用
> 前言：Spark-shell是spark组件提供的交互式解释器，它提供便捷的结果查询，可以帮助开发人员快速的进行代码的验证。

## 〖实验性质〗
验证型
## 〖实验目的〗
1、掌握spark-shell的启动方法
2、掌握Spark常用api的写法
3、学会快速排查代码问题
4、掌握Spark HA集群的搭建和配置
## 〖实验环境及工具〗
1、Standalone模式集群环境
2、spark集群、hadoop文件系统、Spark HA集群
3、IDEA
##〖实验内容〗
### 0. 准备工作
    在 ~/ 目录下，创建文件名称为 personal.txt 的文件。 修改文件内容如下
    name: wutao   # 你的名字
    xuehao: 220312031231  # 你的学号
    class: bigdata 2101  # 你的专业班级
   
    将该文件放到hdfs 的 /user/hadoop/ 目录下：
    hdfs dfs -put personal.txt /user/hadoop    

### 1. 启动Spark-Shell
> Spark-Shell是一个强大的交互式数据分析工具，初学者可以很好的使用它来学习相关API，用户可以在命令行下使用Scala编写Spark程序，并且每当输入一条语句，Spark-Shell就会立即执行语句并返回结果，这就是我们所说的REPL（Read-Eval-Print Loop，交互式解释器），Spark-Shell支持Scala和Python，如果需要进入Python语言的交互式执行环境，只需要执行“pyspark”命令即可。

    在spark/bin目录中，执行下列命令进入Spark-Shell交互环境：

```shell
 bin/spark-shell 
```
#### 1.1 词频统计
```spark-shell
 # val lines = sc.textFile("file:///home/hadoop/personal.txt")
 val lines = sc.textFile("/user/hadoop/personal.txt").flatMap(_.split(" ")).map((_,1)).reduceByKey(_+_).collect
```
#### 1.2 RDD创建
``` spark-shell
# 数组创建
val array = Array(1,2,3,4,5)
val rdd = sc.parallelize(array)
```

#### 1.3 filter
```spark-shell
val  lines =sc.textFile(file:///home/hadoop/personal.txt)
val  linesWithSpark=lines.filter(line => line.contains("wutao")) 
``` 
#### 1.4 map
```spark-shell
data = Array(1,2,3,4,5)
val  rdd1 = sc.parallelize(data)
val  rdd2 =rdd1.map(x=>x+10)

val lines = sc.textFile("file:///home/hadoop/personal.txt")
val words=lines.map(line => line.split(" "))

```
#### 1.5 flatmap
```spark-shell
val lines = sc.textFile("file:///home/hadoop/personal.txt")
val  words=lines.flatMap(line => line.split(" "))
```
#### 1.6 groupByKey
```spark-shell
 val lines = sc.textFile("/user/hadoop/personal.txt").flatMap(_.split(" ")).map((_,1)).groupByKey().collect
```
#### 1.7 reduceByKey
```spark-shell
 val lines = sc.textFile("/user/hadoop/personal.txt").flatMap(_.split(" ")).map((_,1)).reduceByKey(_+_).collect
```

