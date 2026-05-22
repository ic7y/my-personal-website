<style>
pre {
    overflow-y :auto;
    max-height : 500px;
}
</style>


#  WordCount.scala 程序编写 并Jar 执行。

```shell
mkdir -p /home/hadoop/mycode/spark-cf/src/main/scala
gedit /home/hadoop/mycode/spark-cf/src/main/scala/WordCount.scala
```
编写 word count 代码。注意： 这里文件路径固，表示仅统计此文件。
```scala
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.spark.sql.SparkSession

object WordCount {

  def main(args: Array[String]) {
    val inputFile = "file:///home/hadoop/chinesecalendar.log"
    val conf = new SparkConf().setAppName("WordCount").setMaster("local")
    val sc = new SparkContext(conf)
    val textFile = sc.textFile(inputFile)
    val wordCount = textFile.flatMap(line => line.split(" ")).map(word => (word, 1)).reduceByKey((a, b) => a + b)
    wordCount.foreach(println)
  }
}

``` 
sbt 编写打包文件
```shell
cd /home/hadoop/mycode/spark-cf/
vi spark-cf.sbt  
# 输入如下内容
name := "Simple Project"

version := "1.0"

scalaVersion := "2.11.11"

libraryDependencies += "org.apache.spark" %% "spark-core" % "2.1.0"

libraryDependencies += "org.apache.spark" %% "spark-sql" % "2.1.0"

libraryDependencies += "org.apache.spark" %% "spark-mllib" % "2.1.0"
```
sbt 打包
```shell
sbt package  
# 打包时间可能较长，需要下载依赖包

打包完后，执行
 /usr/loca/spark-2.1.0-bin-without-hadoop/bin/spark-submit --class WordCount ~/mycode/spark-cf/target/scala-2.11/simple-project_2.11-1.0.jar
```
查看执行结果。
```
23/11/05 06:04:01 INFO scheduler.TaskSetManager: Starting task 0.0 in stage 1.0 (TID 1, localhost, executor driver, partition 0, ANY, 5821 bytes)
23/11/05 06:04:01 INFO executor.Executor: Running task 0.0 in stage 1.0 (TID 1)
23/11/05 06:04:01 INFO storage.ShuffleBlockFetcherIterator: Getting 1 non-empty blocks out of 1 blocks
23/11/05 06:04:01 INFO storage.ShuffleBlockFetcherIterator: Started 0 remote fetches in 2 ms
(08:11:11,16)
(08:11:13,6)
(08:11:15,122)
(08:11:18,46)
(08:11:24,167)
(08:05:56,137)
(sterm,300)
(08:06:06,46)
(08:06:02,169)
(08:11:23,87)
(08:11:27,26)
(Driver,9522)
(day,279)
(08:05:53,1)
(08:11:30,46)
(08:11:29,308)
(08:11:25,158)
(choliday,300)
(13,1585)
(2023,4761)
(cnote,282)
(time:,4761)
(month,300)
(08:11:16,137)
(08:05:59,81)
(08:06:05,429)
(shengxiao,300)
(Wed,1585)
(08:05:52,15)

```

#  to  be  continue  

