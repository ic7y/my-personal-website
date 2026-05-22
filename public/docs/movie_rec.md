#  课程大作业-推荐系统
## 0. 课程大作业人员分组 
分组: https://docs.qq.com/sheet/DVnlOeUtQR3lMWm5L?tab=7j3oaf&groupUin=QopzzaXP6ht%252Bo045o7GJzg%253D%253D&scode=

要求： 
1. 每组不超过5人。
2. 每个选题不超过2个组。

作业提交目录：

第 xxx 组 - 题目

	学号1-姓名1-题目-大作业报告.docx

  	学号2-姓名2-题目-大作业报告.docx

   	学号3-姓名3-题目-大作业报告.docx

   	学号4-姓名4-题目-大作业报告.docx

   	第xxx组-题目.pptx

   	源代码.rar （包含数据）

   	演示视频.mp4

答辩会议: 

amigo 邀请您参加腾讯会议

会议主题：amigo预定的会议

会议时间：2024/12/23 14:15-16:15 (GMT+08:00) 中国标准时间 - 北京 点击链接入会，或添加至会议列表：

https://meeting.tencent.com/dm/oyfyhLn9WtsI

#腾讯会议：680-238-391

复制该信息，打开手机腾讯会议即可参与


## 1.  推荐系统分为以下几个部分：
1. 前端
        0. 小组成员介绍页面。
        1. 用户登录、注册页面。
        2. 用户评分页面。
        3. 用户请求推荐页面。
        4. 推荐结果页面。

2. 后端
        1. 用户注册账户密码写入。
        2. 用户账号密码查询。
        3. 电影信息查询。
        4. 用户电影评分写入 。
        5. 模型预测用户推荐结果保存到mysql。
        6. 推荐结果查询。

3. 数据集
   1. movielens 数据集： https://www.kaggle.com/datasets/sherinclaudia/movielens?select=users.dat
   2. 美食 数据集： https://www.kaggle.com/datasets/schemersays/food-recommendation-system?select=ratings.csv
   3. 书籍 数据集：https://www.kaggle.com/datasets/vikashrajluhaniwal/jester-17m-jokes-ratings-dataset?select=jester_ratings.csv 
   4. steam游戏 数据集：https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam
   5. 豆瓣电影 数据集：https://www.csuldw.com/2019/09/08/2019-09-08-moviedata-10m/
   6. anime 动画数据集：https://www.kaggle.com/datasets/CooperUnion/anime-recommendations-database/data

## 2. 报表系统分为以下几个部分：


> 报表展示指标内容不限定，可以是关于电商、短视频等。

前端：
       
   0. 小组成员介绍页面
   1. 用户登陆、注册页面
   2. 报表展示页面，报表展示指标不少于8个，用到柱状图、折线图、饼图、漏斗图、地图、雷达图。

后端：
     
   1. 注册账号密码写入
   2. 报表指标查询
   3. 报表指标计算

## 协同过滤算法模型训练及预测
### 步骤：
        1.  代码编写。
        2.  sbt 编译打包。  
        3.  spark-submit 方式提交任务。


## 1.后端 
### 1.1 spark 程序打包
0. 先配置scala 和 sbt， 详见 [sbt-安装](sbt.md ':include')
1. 配置项目
在 spark 工程根目录下 /xxx/xxx/Film_Recommend_Dataframe/  
```shell
gedit Film_Recommend_Dataframe.sbt  
# 输入如下内容
name := "recommend Project"
version := "1.0"
scalaVersion := "2.11.11"
libraryDependencies += "org.apache.spark" %% "spark-core" % "2.1.0"
libraryDependencies += "org.apache.spark" %% "spark-sql" % "2.1.0"
libraryDependencies += "org.apache.spark" %% "spark-mllib" % "2.1.0"
```

```shell
编译打包 
cd  /home/hadoop/homework/bigwork/Film_Recommend_Dataframe
sbt clean package       # 每次修改完代码，都要重新编译打包， 执行完成后, jar包会在这里   /home/hadoop/homework/bigwork/Film_Recommend_Dataframe/target/scala-2.11/simple-project_2.11-1.0.jar
```
### 1.2 mysql 数据库建表 
```shell
service mysql start   # 启动mysql 
mysql -u root -p    # 进入mysql 控制台。

source   /home/hadoop/homework/bigwork/datasets/movie_recommend_data/MovieRecommendDatabase.sql   # 执行这个sql 脚本， 进行建表，和 movie 信息数据 插入。 这个文件的产生 <span id="jump"></span>
# source  /home/hadoop/homework/bigwork/datasets/food_recommendation/foods_insert.sql     # 执行你的数据集的物品信息。 如你是 美食 就是这个。 movielens 的电影就不用执行。
```
foods_insert.sql 文件是在下面[insert_sql.py](#jump_insert)

### 1.3 hadoop 环境启动 
```shell
/usr/local/hadoop-2.7.1/sbin/start-dfs.sh
```

## 2. 前端网页
### 2.1 创建前端项目目录
```shell
mkdir -p ~/movierecommendapp  # 如果你是copy的文件，这一步不用操作，直接cd 的copy 文件的目录下即可。
cd ~/movierecommendapp    # 如果你是copy的文件，这一步不用操作，直接cd 的copy 文件的目录下即可。
npm init
```
### 2.2 安装相关模块
```shell
npm --registry https://registry.npm.taobao.org install express --save
npm --registry https://registry.npm.taobao.org install jade --save
npm --registry https://registry.npm.taobao.org install body-parser --save
npm --registry https://registry.npm.taobao.org install mysql --save
```
### 2.3 创建服务器
```shell
gedit movierecommend.js
# 1. 修改 配置mysql 内容中， password 的密码为 hadoop
# 2. 修改
const path = 'file:///home/hadoop/homework/bigwork/datasets/movie_recommend_data';   // 这里的路径是 你数据的根目录。
//调用Spark程序为用户推荐电影并把推荐结果写入数据库.   这里 /xxx/simple-preject_2.11-1.0.jar 是你 用sbt 对后端代码打包后的 jar 文件路径。  这里的 ratings.dat 就是你数据里的打分数据， movies.dat 是电影的信息数据， :: 是你这两个文件里是以什么作为 分隔符。 对不同的数据集这里对应的文件名不同，分隔符也不同。
let spark_submit = spawnSync('/usr/local/spark-2.1.0-bin-without-hadoop/bin/spark-submit',['--class', 'recommend.MovieLensALS','/home/hadoop/homework/bigwork/Film_Recommend_Dataframe/target/scala-2.11/simple-project_2.11-1.0.jar', path, userid , 'ratings.dat','movies.dat','::' ],{ shell:true, encoding: 'utf8' });
```
```shell
gedit views/personalratings.jade
将 //p 电影名称:#{movieforpage[i].moviename} ->  p #{movieforpage[i].moviename}
```
### 2.4 添加模版文件
....
### 2.5 启动服务
```shell
cd ~/movierecommendapp
node movierecommend.js
```


#### insert_sql 生成代码

<span id="jump_insert"></span>

```python
import os
import random


name_dict={}

urls=[]


def readUrlFromFile(inpath):
    with open( inpath, 'r', encoding='utf-8') as f :
        for line in f:
            arr = line.split(',')
            url = arr[0]
            name = "1" if len(arr) ==1  else  arr[1]
            urls.append(url)
            name_dict[name] = url
        f.close()

def insert_rec_item_sql(path, data_type ):
    # item_data = open(path,'r')
    outpath =  path.split('.')[0] +"_insert.sql"
    if os.path.exists( outpath ) :
        os.remove(outpath)
    outfile = open(outpath,'w', encoding='utf8' )
    with open( path, 'r', encoding='utf8' ) as f:
        insert_sql = "use movierecommend; delete from movieinfo ;\n  INSERT INTO movieinfo values "
        if data_type == 'douban' :
            # 逐行读取文件内容
            n = 0
            for line in f:
                # 处理每一行的内容
                if n == 0 :
                    n = 1
                    continue
                arr = line.replace('"','').split(',')
                movie_id = arr[0]
                movie_name = arr[1]
                releasetime = arr[18]
                director = arr[5]
                leadactors = arr[3]
                picture = arr[4]
                averating = arr[6]
                numrating = arr[7]
                description = arr[16]
                typelist = arr[8]
                if len(picture) < 3 :
                    picture = random.choice(urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                if n > 10 :
                    break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)
        if data_type == 'anime' :
            # 逐行读取文件内容
            n = 0
            for line in f:
                # 处理每一行的内容
                if n == 0 :
                    n = 1
                    continue
                arr = line.replace('"','').split(',')
                movie_id = arr[0]
                movie_name = arr[1]
                releasetime = ""
                director = ""
                leadactors = ""
                picture = ""
                averating = "0"
                numrating = "0"
                description = ""
                typelist = arr[2]
                if len(picture) < 3 :
                    picture = random.choice(urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                # if n > 10 :
                #     break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)
        if data_type == 'food' :
            # 逐行读取文件内容
            n = 0
            for line in f:
                # 处理每一行的内容
                if n == 0 :
                    n = 1
                    continue
                arr = line.replace('"','').split(',')
                movie_id = arr[0]
                movie_name = arr[1]
                releasetime = ""
                director = ""
                leadactors = ""
                picture = ""
                averating = "0"
                numrating = "0"
                description = ""
                typelist = arr[2]
                if len(picture) < 3 :
                    picture = random.choice(urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                # if n > 10 :
                #     break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)
        if data_type == 'game' :
            # 逐行读取文件内容
            n = 0
            idx={}
            for line in f:
                # 处理每一行的内容
                if n == 0 :
                    n = 1
                    continue
                arr = line.replace('"','').replace("'",'').replace("\\","").split(',')
                movie_id = re.sub('[a-zA-Z]',"",arr[0].split(' ')[0] )
                movie_id=movie_id[0:10]
                movie_name=arr[1]
                releasetime = ""
                director = ""
                leadactors = ""
                picture = ""
                averating = "0"
                numrating = "0"
                description = ""
                typelist = ""
                if  int(movie_id) in idx  :
                    continue
                else :
                    idx[int(movie_id)] = 1

                if len(picture) < 3 :
                    picture = random.choice(urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                # if n > 10 :
                #     break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)


        if data_type == 'book' :
            # 逐行读取文件内容
            n = 0
            for line in f:
                # 处理每一行的内容
                if n == 0 :
                    n = 1
                    continue
                arr = line.replace('"','').split(',')
                movie_id = arr[0]
                movie_name = arr[1]
                releasetime = arr[3]
                director = arr[2]
                leadactors = ""
                picture = arr[6]
                averating = "0"
                numrating = "0"
                description = ""
                typelist = ""
                if len(picture) < 3 :
                    picture = random.choice(urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                # if n > 10 :
                #     break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)

        outfile.write(insert_sql)

readUrlFromFile("/home/hadoop/Documents/bigwork/tmp")

#insert_rec_item_sql("/home/hadoop/Documents/bigwork/datasets/douban_movie/movies.csv","douban")
#insert_rec_item_sql("/home/hadoop/Documents/bigwork/datasets/anime_recommendations/anime.csv","anime")
insert_rec_item_sql("/home/hadoop/Documents/bigwork/datasets/food_recommendation/food.csv","food")
#insert_rec_item_sql("/home/hadoop/Documents/bigwork/datasets/book/Books.csv","book")
#insert_rec_item_sql("/home/hadoop/Documents/bigwork/datasets/movielens/movies.dat","movielens")
#insert_rec_item_sql("/home/hadoop/Documents/bigwork/datasets/game_recommendations_on_steam/games.csv","game")

```

###  游戏评分数据单独处理

1. 删除游戏评分数据集下除zip 之外的文件
```shell
cd /home/hadoop/Documents/bigwork/datasets/game_recommendations_on_steam
rm *.json 
rm *.csv
```
2. 解压缩 文件
```shell
unzip archive.zip
```
3. 处理用户评分数据

新建 user_rating.py 文件，添加以下代码。 并执行该文件。python3 user_rating.py

```python
import os
import random
import re

def insert_rec_item_sql(path ):
    # item_data = open(path,'r')
    outpath =  "ratings.csv"
    if os.path.exists( outpath ) :
        os.remove(outpath)
    outfile = open(outpath,'w', encoding='utf8' )
    with open( path, 'r', encoding='utf8' ) as f:
        f.readline()
        for line in f:
       #     print(line)
            arr = line.replace('"','').replace("'",'').replace("\\","").split(',')
            userid = arr[0]
            itemid = arr[1]
            review = int(arr[2])
            rating = 0
            if review  >=2 and review <4 :  
                rating = 1
            elif review >=4 and review <6 :
                rating = 2
            elif review >=6 and review <8 :
                rating = 3
            elif review >=8 and review <10 :
                rating = 4
            elif review >=10 :
                rating = 5
        
            res = userid+ ',' + itemid  +','+ str(rating)+','+'20241104\n' 

            outfile.write(res)

insert_rec_item_sql("/home/hadoop/Documents/bigwork/datasets/game_recommendations_on_steam/users.csv")


```
## MovieLensALS.scala
```scala
package recommend

import java.io.File
import org.apache.log4j.{Level, Logger}
import org.apache.spark.ml.recommendation.{ALS, ALSModel}
import org.apache.spark.mllib.recommendation.Rating
import org.apache.spark.rdd.RDD
import org.apache.spark.sql.{DataFrame, Row, SparkSession}
import org.apache.spark.{SparkConf, SparkContext}
import org.apache.commons.lang.StringUtils;
import scala.util.Random
import org.apache.spark.sql.functions._

object MovieLensALS {
  case class Rating(user : Int,  product : Int,  rating : Double ,  originProduct : String, productName: String)
  val spark=SparkSession.builder().appName("MovieLensALS").master("local[2]").getOrCreate()

  def main(args: Array[String]) {
    // 屏蔽不必要的日志显示在终端上
    Logger.getLogger("org.apache.spark").setLevel(Level.ERROR)
    Logger.getLogger("org.eclipse.jetty.server").setLevel(Level.OFF)
    if (args.length != 5) {
      println("Usage: /usr/local/spark/bin/spark-submit --class recommend.MovieLensALS " +
        "Spark_Recommend_Dataframe.jar movieLensHomeDir userid")
      sys.exit(1)
    }
    // 设置运行环境
    import spark.implicits._
    val random = new Random()

    // 装载参数二,即用户评分,该评分由评分器生成
    val userid=args(1).toInt ;
    //删除该用户之前已经存在的电影推荐结果，为本次写入最新的推荐结果做准备
    DeleteFromMySQL.delete(userid)
    //从关系数据库中读取该用户对一些电影的个性化评分数据
    val personalRatingsLines:Array[String]=ReadFromMySQL.read(userid)
    val myRatings = loadRatings(personalRatingsLines)
    val myRatingsRDD = spark.sparkContext.parallelize(myRatings, 1)

    // 样本数据目录
    val movieLensHomeDir = args(0)
    val moviePath = args(2)
    val ratingPath = args(3)
    val delimiter = args(4) 
    // 装载样本评分数据,其中最后一列 Timestamp 取除 10 的余数作为 key,Rating 为值,即(Int,Rating)
    //ratings.dat 原始数据:用户编号、电影编号、评分、评分时间戳
    val ratings = spark.sparkContext.textFile(new File(movieLensHomeDir,
      ratingPath).toString).filter( x => { val len = x.split(delimiter).length; len >=2 || len <= 4 } ).map( line => {
      //println("ratings: "+line)  
      val fields = line.split(delimiter)
      var res = (-1, Rating(-1,-1,-1,"-1","-1")) 
      try{
        //var useridstr = fields(0).filter(_.isDigit) 
        //val userid = StringUtils.substring( useridstr, useridstr.length - 9, useridstr.length).toInt
        //val movie_id= StringUtils.substring(fields(1).filter(_.isDigit), fields(1).filter(_.isDigit).length - 9, fields(1).filter(_.isDigit).length  ).toInt
        val userid = StringUtils.substring( fields(0).replaceAll("[^0-9]", ""), 0, 9).toInt 
        val movie_id = fields(1).replaceAll("[^0-9]", "").toInt 
        
        val score = fields(2).toDouble
       // println("ratings: " + userid.toString + "," + movie_id.toString +"," + score.toString )
        
        res= (random.nextInt(200) % 10, Rating( userid , movie_id, score, fields(1),"" ) )
      
      } catch {
        case e : Exception =>{
        println("err: "+ line)
        res =  (random.nextInt(200) % 10, Rating (-1,-1,-1,"-1","") )
        }
      }
      res 
      }
      ).filter(x => x._2.user >0 )
    
    ratings.map( x=> x._2 ).toDF.show()
    //装载电影目录对照表(电影 ID->电影标题)
    //movies.dat 原始数据:电影编号、电影名称、电影类别
    val movies = spark.sparkContext.textFile(new File(movieLensHomeDir,
      moviePath).toString).map( line => {
      val fields = line.split(delimiter)
      //println("movie: "+ line)
      var res = (-1, "err", "-1" )
      try{
        val movie_id = fields(0).replaceAll("[^0-9]", "").toInt 
        // val movie_id = StringUtils.substring(fields(0).filter(_.isDigit),fields(0).filter(_.isDigit).length - 9, fields(0).filter(_.isDigit).length  ).toInt
        res = ( movie_id , fields(1).toString(), fields(0) )

      } catch {
        case e : Exception => {
          println(line)
        }
      }
      res
    }).filter(x => x._1 >0 )
    
    val movies_key = movies.map(x=>x._1).collect()
    val moviesDF = movies.toDF("product","productName","originProduct")
    
    
    val numRatings = ratings.count()
    val numUsers = ratings.map(_._2.user).distinct().count()
    val numMovies = ratings.map(_._2.product).distinct().count()
    println("ratings stat: num = "+ numRatings.toString + ", numUsers = "+ numUsers.toString+" , numMovies = "+ numMovies.toString )
    println("movies stat: num = "+ movies_key.size )
    // 将样本评分表以 key 值切分成 3 个部分,分别用于训练 (60%,并加入用户评分), 校验 (20%), and 测试 (20%)
    // 该数据在计算过程中要多次应用到,所以 cache 到内存
    val numPartitions = 4
    // training 训练样本数据


    val trainingDF = ratings.filter(x => x._2.rating > 0 )
      //.filter(x => x._1 < 6) //取评分时间除 10 的余数后值小于 6 的作为训练样本
      .values
      .union(myRatingsRDD) //注意 ratings 是(Int,Rating),取 value 即可
      .toDF()
      .repartition(numPartitions)

    // validation 校验样本数据
    val validationDF = ratings.filter(x => x._1 >= 6 && x._1 < 8 && x._2.rating > 0 ) //取评分时间除 10 的余数后值大于等于 6 且小于 8 分的作为校验样本
      .values
      .toDF()
      .repartition(numPartitions)

    // test 测试样本数据

    val testDF = ratings.filter(x => x._1 >= 8 && x._2.rating > 0 ).values.toDF() //取评分时间除 10 的余数后值大于等于 8 分的作为测试样本
    val numTraining = trainingDF.count()
    val numValidation = validationDF.count()
    val numTest = testDF.count()
    // 训练不同参数下的模型,并在校验集中验证,获取最佳参数下的模型
    val ranks = List(8, 12) //模型中隐语义因子的个数
    val lambdas = List(0.1, 1,5,10.0) //是 ALS 的正则化参数
    val numIters = List(10, 10) //迭代次数
    var bestModel: Option[ALSModel] = None //最好的模型
    var bestValidationRmse = Double.MaxValue //最好的校验均方根误差
    var bestRank = 0 //最好的隐语义因子的个数
    var bestLambda = 0.0  //最好的ALS正则化参数
    var bestNumIter = 2  //最好的迭代次数
    for (rank <- ranks; lambda <- lambdas; numIter <- numIters) {
      println("正在执行循环训练模型")
      val als = new ALS().setMaxIter(numIter).setRank(rank).setRegParam(lambda).setUserCol("user").setItemCol("product").setRatingCol("rating")
      val model = als.fit(trainingDF)//训练样本、隐语义因子的个数、迭代次数、ALS 的正则化参数
      // model 训练模型
      //输入训练模型、校验样本、校验个数
      val validationRmse = computeRmse(model, validationDF, numValidation) // 校验模型结果
      println( "cur rmse = " + validationRmse.toString + "  bset rmse" +  bestValidationRmse.toString )
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

    val candidate_products = spark.sparkContext.parallelize(movies_key.filter(!myRatedMovieIds.contains(_)).toSeq).toDF("product" ) 
    
    val candidates = moviesDF.join(candidate_products,Seq("product" )).withColumn("user",lit(userid))
    println("candidates productid :")
    candidates.show()
    //candidates.collect
    //.map(Rating(userid,_,0.0,_)).toDF().select("user","product")
    //上面的Rating(userid,_,0.0)中，0.0是赋予的初始评分值
    val predictions = bestModel.get.transform(candidates)
    predictions.filter("prediction is null").show()
   
    predictions.select("user","product","prediction","originProduct","productName")
    .createTempView("recommedations")

    val recommendations = spark.sql("select * from (select user, product, case when prediction = 'NaN' then '0.0' else prediction end as prediction, originProduct, productName from recommedations ) a order by prediction desc limit 20 ")
    //把推荐结果写入数据库
    val rddForMySQL=recommendations
    .withColumn("full_name", concat(col("user"), lit("::"), col("originProduct"), lit("::"),col("prediction"), lit("::"),col("productName")  )).select("full_name").map(r => r.getString(0)).collect()
    //.map(r=>r.user + "::"+ r.originProduct + "::"+ r.rating+"::" +r.productName )
    InsertIntoMySQL.insert(rddForMySQL)
    var i = 1
    println("Movies recommended for you(用户 ID:推荐电影 ID:推荐分数:推荐电影名称):")
    recommendations.show()
   // .foreach { r =>
   //   println(r.user + ":" + r.product + ":" + r.rating + ":" + r.productName)
   //   i += 1
   // }
    spark.sparkContext.stop()
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
      .take(500)

    math.sqrt(predictionsAndRatings.map(x => (x._1.toString.toDouble  - x._2.toString.toDouble) * (x._1.toString.toDouble - x._2.toString.toDouble)).reduce(_ + _) / n)
  }

  /** 装载用户评分文件 **/
  def loadRatings(lines: Array[String]): Seq[Rating] = {
    val ratings = lines.map { line =>
      val fields = line.split("::")
      var res = Rating( -1, -1, 0.0,"-1","-1" )
      try{ 
        val movie_id = fields(1).replaceAll("[^0-9]", "").toInt 
        res = Rating(fields(0).toInt, movie_id , fields(2).toDouble, fields(1),"-1" ) 
      } catch {
        case e : Exception => {
          println(line)
        }
      }
      res
    }.filter(_.rating > 0.0)
    if (ratings.isEmpty) {
      sys.error("No ratings provided.")
    } else {
      ratings.toSeq
    }
  }

}
```
