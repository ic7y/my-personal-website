<style>
pre {
    overflow-y :auto;
    max-height : 500px;
}
</style>

# 1. spark-shell 下粘贴
```scala
scala> :paste
开始粘贴你的代码，粘贴完了, 用 ctrl-d 退出粘贴。
```
# 2. spark-mllib 协同过滤算法 
```scala

import java.io.File

import org.apache.log4j.{Level, Logger}
import org.apache.spark.ml.recommendation.{ALS, ALSModel}
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, Row, SparkSession}
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.spark.ml.evaluation.RegressionEvaluator
import scala.io.Source

case class Rating(userId : Int, movieId : Int, rating : Float, timestamp: Long )

def parseRating(str: String): Rating = {
	val fields = str.split("::")
	assert(fields.size == 4 )
	Rating( fields(0).toInt, fields(1).toInt, fields(2).toFloat, fields(3).toLong )
}
import spark.implicits._

val ratings = spark.sparkContext.textFile("file:///usr/local/spark-2.1.0-bin-without-hadoop/data/mllib/als/sample_movielens_ratings.txt").map(parseRating).toDF()

val Array(training, test) = ratings.randomSplit(Array(0.8,0.2))

val alsExplicit = new ALS().setMaxIter(5).setRegParam(0.01).setUserCol("userId").setItemCol("movieId").setRatingCol("rating")

val modelExplicit = alsExplicit.fit(training)

val preditionsExplicit = modelExplicit.transform(test)

preditionsExplicit.show()

val evaluator = new RegressionEvaluator().setMetricName("rmse").setLabelCol("rating").setPredictionCol("prediction")

val rmseExplicit = evaluator.evaluate(preditionsExplicit)

println(s"Explicit: Root-mean-square error = $rmseExplicit")

```
#  协同过滤算法 sbt  
