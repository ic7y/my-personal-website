<style>
pre { 
    overflow-y :auto;
    max-height : 500px;
}
</style>
```scala

import java.io.File

import org.apache.log4j.{Level, Logger}
import org.apache.spark.ml.recommendation.{ALS, ALSModel}
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, Row, SparkSession}
import org.apache.spark.{SparkConf, SparkContext}

import scala.io.Source


``` 
