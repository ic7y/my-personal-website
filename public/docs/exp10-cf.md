# 实验11  协同过滤算法

> 前言：协同过滤算法是众多推荐算法之一，但以其优秀的算法思想和不复杂的工程实现难度，以及不错的推荐效果，深受各大公司网站所使用。而spark mllib里的实现更大为降低了该算法的使用，且依赖于spark的大数据处理能力，使得模型很快能够得到验证。Spark mllib 该库包含了许多机器学习算法，开发者可以不需要深入了解机器学习算法就能开发出相关程序。
## 〖实验性质〗

验证型

## 〖实验目的〗

1、了解什么是机器学习及Spark MLlib的基本使用方式

2、掌握机器学习的工作流程

3、了解电影推荐系统的构建流程

4、代码实现协同过滤算法

## 〖实验环境及工具〗

1、hadoop

2、spark

3、MLlib

## 〖实验内容〗

### 一、前置准备

1．进入linux， 点击 右键-Open in Terminal 。

2．进入spark-shell

（1）cd  ../Downloads/spark-2.1.0-bin-without-hadoop/bin 

（2）./spark-shell 

### 二、构建机器学习工作流(以逻辑回归为例)

1．创建spark-session对象
```scala
import org.apache.spark.sql.SparkSession
val spark = SparkSession.builder().
master("local").
appName("my App Name").
getOrCreate()
```

2．引入相应的算法包和创建待训练数据的对象
```scala
import org.apache.spark.ml.feature._
import org.apache.spark.ml.classification.LogisticRegression
import org.apache.spark.ml.{Pipeline,PipelineModel}
import org.apache.spark.ml.linalg.Vector
import org.apache.spark.sql.Row
  
val training = spark.createDataFrame(Seq(
(0L, "a b c d e spark", 1.0),
(1L, "b d", 0.0),
(2L, "spark f g h", 1.0),
(3L, "hadoop mapreduce", 0.0)
)).toDF("id", "text", "label")
```
3．定义 Pipeline 中的各个流水线阶段PipelineStage，包括转换器和评估器，具体地，包含tokenizer, hashingTF和lr
```scala
val tokenizer = new Tokenizer().
 setInputCol("text").
 setOutputCol("words")
 
val hashingTF = new HashingTF().
setNumFeatures(1000).
setInputCol(tokenizer.getOutputCol).
 setOutputCol("features")
 
val lr = new LogisticRegression().
 setMaxIter(10).
 setRegParam(0.01)
```

4．按照具体的处理逻辑有序地组织PipelineStages，并创建一个Pipeline
```scala
val pipeline = new Pipeline().
 setStages(Array(tokenizer, hashingTF, lr))
val model = pipeline.fit(training)
```

5．构建测试数据
```scala
val test = spark.createDataFrame(Seq(
 (4L, "spark i j k"),
 (5L, "l m n"),
 (6L, "spark a"),
 (7L, "apache hadoop")
 )).toDF("id", "text")
```

6．调用之前训练好的PipelineModel的transform()方法，让测试数据按顺序通过拟合的流水线，生成预测结果
```scala
model.transform(test).
 select("id", "text", "probability", "prediction").
 collect().
 foreach { case Row(id: Long, text: String, prob: Vector, prediction: Double) =>  println(s"($id, $text) --> prob=$prob, prediction=$prediction")
 }
```

### 三、协同过滤算法实现
1．导入需要的包

```scala
import java.io.File

import org.apache.log4j.{Level, Logger}
import org.apache.spark.ml.recommendation.{ALS, ALSModel}
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, Row, SparkSession}
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.spark.ml.evaluation.RegressionEvaluator
import scala.io.Source
```
2．创建数据类型

```scala
case class Rating(userId : Int, movieId : Int, rating : Float, timestamp: Long )

def parseRating(str: String): Rating = {
    val fields = str.split("::")
    assert(fields.size == 4 )
    Rating( fields(0).toInt, fields(1).toInt, fields(2).toFloat, fields(3).toLong )
}
```

3．读取数据
```scala
import spark.implicits._

val ratings = spark.sparkContext.textFile("file:///home/hadoop/Downloads/spark-2.1.0-bin-without-hadoop/data/mllib/als/sample_movielens_ratings.txt").map(parseRating).toDF()
```
4．数据划分
```scala
val Array(training, test) = ratings.randomSplit(Array(0.8,0.2))
```
5．建立模型
```scala
val alsExplicit = new ALS().setMaxIter(5).setRegParam(0.01).setUserCol("userId").setItemCol("movieId").setRatingCol("rating")
```
6．模型训练
```scala
val modelExplicit = alsExplicit.fit(training)
```
7．模型预测
```scala
val modelExplicit = alsExplicit.fit(training)
```

8．模型预测
```scala
val preditionsExplicit = modelExplicit.transform(test)

preditionsExplicit.show()
```
9．模型评估
```scala
val evaluator = new RegressionEvaluator().setMetricName("rmse").setLabelCol("rating").setPredictionCol("prediction")
val rmseExplicit = evaluator.evaluate(preditionsExplicit)
println(s"Explicit: Root-mean-square error = $rmseExplicit")
```
## 〖课后实验作业〗

在自己电脑上重复本实验所有实例案例和程序案例，理解本节内容，尝试自己编写隐反馈模型。
