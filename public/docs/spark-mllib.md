<style>
pre {
    overflow-y :auto;
    max-height : 1000px;
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

case class Rating(user : Int, product : Int, rating : Double)

 /** 装载用户评分文件 **/
def loadRatings(path: String): Seq[Rating] = {
    val lines = Source.fromFile(path).getLines()
    val ratings = lines.map { line =>
      val fields = line.split("::")
      Rating(fields(0).toInt, fields(1).toInt, fields(2).toDouble)
    }.filter(_.rating > 0.0)
    if (ratings.isEmpty) {
      sys.error("No ratings provided.")
    } else {
      ratings.toSeq
    }
}

/** 校验集预测数据和实际数据之间的均方根误差 **/
  //输入训练模型、校验样本、校验个数
def computeRmse(model: ALSModel, df: DataFrame, n: Long): Double = {
    import spark.implicits._
    val predictions = model.transform(df.select("user","product")) //调用预测的函数
    // 输出 predictionsAndRatings 预测和评分
    val predictionsAndRatings = predictions.select("user","product","prediction").rdd.map(x => ((x(0),x(1)),x(2)))
      .join(df.select("user","product","rating").rdd.map(x => ((x(0),x(1)),x(2))))
      .values
      .take(10)

    math.sqrt(predictionsAndRatings.map(x => (x._1.toString.toDouble  - x._2.toString.toDouble) * (x._1.toString.toDouble - x._2.toString.toDouble)).reduce(_ + _) / n)
}


// 设置运行环境
import spark.implicits._

val myRatingPath = "/usr/local/spark-2.1.0-bin-without-hadoop/data/mllib/als/sample_movielens_ratings.txt"

// 装载参数二,即用户评分,该评分由评分器生成
val myRatings = loadRatings(myRatingPath)
val myRatingsRDD = spark.sparkContext.parallelize(myRatings, 1)
// 样本数据目录
val movieLensHomeDir = "file:///usr/local/park-2.1.0-bin-without-hadoopdata/mllib/als/"
// 装载样本评分数据,其中最后一列 Timestamp 取除 10 的余数作为 key,Rating 为值,即(Int,Rating)
//ratings.dat 原始数据:用户编号、电影编号、评分、评分时间戳
val ratings = spark.sparkContext.textFile( movieLensHomeDir + "ratings.dat" ).map { line =>
      val fields = line.split("::")
      (fields(3).toLong % 10, Rating(fields(0).toInt, fields(1).toInt,
        fields(2).toDouble))
    }
    //装载电影目录对照表(电影 ID->电影标题)
    //movies.dat 原始数据:电影编号、电影名称、电影类别
    val movies = spark.sparkContext.textFile(new File(movieLensHomeDir + "movies.dat" ).map { line =>
      val fields = line.split("::")
      (fields(0).toInt, fields(1).toString())
    }.collect().toMap

    val numRatings = ratings.count()
    val numUsers = ratings.map(_._2.user).distinct().count()
    val numMovies = ratings.map(_._2.product).distinct().count()
    // 将样本评分表以 key 值切分成 3 个部分,分别用于训练 (60%,并加入用户评分), 校验 (20%), and 测试 (20%)
    // 该数据在计算过程中要多次应用到,所以 cache 到内存
    val numPartitions = 4

    // training 训练样本数据
    val trainingDF = ratings.filter(x => x._1 < 6) //取评分时间除 10 的余数后值小于 6 的作为训练样本
      .values
      .union(myRatingsRDD) //注意 ratings 是(Int,Rating),取 value 即可
      .toDF()
      .repartition(numPartitions)

    // validation 校验样本数据
    val validationDF = ratings.filter(x => x._1 >= 6 && x._1 < 8) //取评分时间除 10 的余数后值大于等于 6 且小于 8 分的作为校验样本
      .values
      .toDF()
      .repartition(numPartitions)

    // test 测试样本数据

    val testDF = ratings.filter(x => x._1 >= 8).values.toDF() //取评分时间除 10 的余数后值大于等于 8 分的作为测试样本
    val numTraining = trainingDF.count()
    val numValidation = validationDF.count()
    val numTest = testDF.count()
    // 训练不同参数下的模型,并在校验集中验证,获取最佳参数下的模型
    val ranks = List(8, 12) //模型中隐语义因子的个数
    val lambdas = List(0.1, 10.0) //是 ALS 的正则化参数
    val numIters = List(10, 20) //迭代次数
    var bestModel: Option[ALSModel] = None //最好的模型
    var bestValidationRmse = Double.MaxValue //最好的校验均方根误差
    var bestRank = args(2).toInt //最好的隐语义因子的个数
    var bestLambda = args(3).toDouble  //最好的ALS正则化参数
    var bestNumIter = args(4).toInt  //最好的迭代次数
    //val model = ALS.train(training, bestRank, bestNumIter, bestLambda) //如果是从外部传入参数，则使用该语句训练模型
    //如果不使用外部传入的参数，而是使用上面定义的ranks、lambdas和numIters的列表值进行模型训练，则使用下面的for循环语句训练模型
    for (rank <- ranks; lambda <- lambdas; numIter <- numIters) {
      val als = new ALS().setMaxIter(numIter).setRank(rank).setRegParam(lambda).setUserCol("user").setItemCol("product").setRatingCol("rating")
      val model = als.fit(trainingDF)//训练样本、隐语义因子的个数、迭代次数、ALS 的正则化参数
      // model 训练模型
      //输入训练模型、校验样本、校验个数
      val validationRmse = computeRmse(model, validationDF, numValidation) // 校验模型结果
      if (validationRmse < bestValidationRmse) {
        bestModel = Some(model)
        bestValidationRmse = validationRmse
        bestRank = rank
        bestLambda = lambda
        bestNumIter = numIter
      }
    }
    // 用最佳模型预测测试集的评分,并计算和实际评分之间的均方根误差
    val testRmse = computeRmse(bestModel.get, testDF, numTest)
    //创建一个基准(Naïve Baseline),并把它和最好的模型进行比较
    val meanRating = trainingDF.union(validationDF).select("rating").rdd.map{case Row(v : Double) => v}.mean
    val baselineRmse = math.sqrt(testDF.select("rating").rdd.map{case Row(v : Double) => v}.map(x => (meanRating - x) * (meanRating - x)).mean)
    //改进了基准的最佳模型
    val improvement = (baselineRmse - testRmse) / baselineRmse * 100
    // 推荐前十部最感兴趣的电影,注意要剔除用户已经评分的电影
    val myRatedMovieIds = myRatings.map(_.product).toSet

    val candidates = spark.sparkContext.parallelize(movies.keys.filter(!myRatedMovieIds.contains(_)).toSeq).map(Rating(1,_,0.0))
      .toDF().select("user","product")
    //上面的Rating(1,_,0.0)中，1表示用户的userid，0.0是赋予的初始评分值，如果为userid为2的用户预测评分值，则需要修改为Rating(2,_,0.0)
    val recommendations = bestModel.get
      .transform(candidates).select("user","product","prediction").rdd
      .map(x => Rating(x(0).toString.toInt,x(1).toString.toInt,x(2).toString.toDouble))
      .sortBy(-_.rating)
      .take(10)
    var i = 1
    println("Movies recommended for you(用户 ID:推荐电影 ID:推荐分数:推荐电影名称):")
    recommendations.foreach { r =>
      println(r.user + ":" + r.product + ":" + r.rating + ":" + movies(r.product))
      i += 1
    }

``` 
