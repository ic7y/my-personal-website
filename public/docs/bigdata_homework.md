#  课程大作业-推荐系统
## 0. 课程大作业人员分组 
分组: https://docs.qq.com/sheet/DVnlOeUtQR3lMWm5L?tab=7j3oaf&groupUin=QopzzaXP6ht%252Bo045o7GJzg%253D%253D&scode= 

要求： 
1. 每组不超过4人。
2. 每个选题不超过2个组。

## 推荐系统分为以下几个部分：
1. 前端
        1. 用户登录、注册。
        2. 用户对指定项目进行评分，并返回推荐的项目列表。

2. 后端
        1. 协同过滤模型算法训练。
        2. 预测结果保存到mysql。

3. 数据集
   1. movielens 数据集： https://www.kaggle.com/datasets/sherinclaudia/movielens?select=users.dat
   2. 美食 数据集： https://www.kaggle.com/datasets/schemersays/food-recommendation-system?select=ratings.csv
   3. 笑话 数据集：https://www.kaggle.com/datasets/vikashrajluhaniwal/jester-17m-jokes-ratings-dataset?select=jester_ratings.csv 
   4. steam游戏 数据集：https://www.kaggle.com/datasets/antonkozyriev/game-recommendations-on-steam
   5. 豆瓣电影 数据集：https://www.csuldw.com/2019/09/08/2019-09-08-moviedata-10m/
   6. anime 动画数据集：https://www.kaggle.com/datasets/CooperUnion/anime-recommendations-database/data

## 配置
### 步骤：
#### 1. 修改推荐的项目内容 。
```shell
cd /home/hadoop/homework/bigwork/nodeapp/movierecommendapp
nvm use 18
gedit movierecommend.bak.js
找到如下部分
"
  var connection = mysql.createConnection({
        host     : '127.0.0.1',
        user     : 'root',
        password : 'hadoop',                                                 //  这里的密码 hadoop 换成 123456
        database : 'movierecommend',
        port:'3306'
    });

  const pool = mysql.createPool({
  	host     :  '127.0.0.1',
  	user     :  'root',
  	password :  'hadoop',                                                     //  这里的密码 hadoop 换成 123456 
  	database :  'movierecommend'
    });

    
    /**
     * 把 app.get('/recommendmovieforuser', async function (req,res) 的函数内容 替换为下面这段代码。 
     */     
    app.get('/recommendmovieforuser', async function (req,res) {
    const userid = req.query.userid;
    const username = req.query.username;
    const newRec = req.query.newRec; // 是否强制刷新推荐（现在无意义，可忽略）

    // 随机查询 10 部电影（可根据需要调整数量）
    const selectRandomMoviesSQL = `
        SELECT movieid, moviename, picture 
        FROM movieinfo 
        ORDER BY RAND() 
        LIMIT 10
    `;

    try {
        const rows = await query(selectRandomMoviesSQL);

        const movieinfolist = rows.map(row => ({
            userid: userid,           // 可以保留用于模板显示
            movieid: row.movieid,
            moviename: row.moviename,
            picture: row.picture,
            rating: null              // 如果模板需要 rating 字段可设为 null
        }));

        // 渲染页面
        res.render('recommendresult', {
            title: 'Recommend Result',
            message: 'Here are some random movies for you',
            username: username,
            movieinfo: movieinfolist
        });

    } catch (err) {
        console.error('Database query error:', err);
        res.status(500).send('Error fetching movie data');
    }
});  
 

"
```
#### 2. 数据库的项目信息表 movierecommend.movieinfo  中，插入项目的信息。 
```shell
cd /home/hadoop/homework/bigwork/
gedit  insert_sql.py 
找到如下部分：
insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/douban_movie/movies.csv","douban")
#insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/anime_recommendations/anime.csv","anime")
#insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/food_recommendation/food.csv","food")
#insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/book/Books.csv","book")
根据你的数据，把前面的 '#' 注释去掉，保存，退出编辑。

Python3 insert_sql.py   // 执行成功后，在你数据的目录下，会产生一个 xxx_instert.sql 文件。
mysql -u root -p    // 输入密码： hadoop 
source  /home/hadoop/homework/bigwork/datasets/xxxxxx/xxx_insert.sql ;        // 这样 相应的项目信息都插入到数据库的 movierecommend.movieinfo 表中了。
```

#### 3. 启动推荐系统
```shell
cd /home/hadoop/homework/bigwork/nodeapp/movierecommendapp/
node movierecommend.bak.js    // 启动后台服务。
```
#### 4. 打开火狐浏览器
地址栏输入： localhost:3000

#### 5. 修改一些展示问题。
```shell
cd /home/hadoop/homework/bigwork/Node.js代码/movierecommendapp/views
gedit  index.jade     // 系统首页显示页面  根据你的需要修改相应文字，和轮播图片。
gedit  personalratings.jade    // 用户打分页面， 修改相应文字。
gedit  recommendresult.jade     // 推荐结果页面，修改相应文字。
gedit  userscoresuccess.jade    // 用户打分结果页面，修改相应文字。
```

#### insert_sql 生成代码
```python
import os
import random
import re

idx={}

pic_urls=[ 'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2242233770.webp'
    ,'https://img1.doubanio.com/view/photo/s_ratio_poster/public/p2242233770.webp'
    ,'https://img2.doubanio.com/view/photo/s_ratio_poster/public/p2897502151.jpg'
    ,'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2898254504.jpg'
    ,'https://img9.doubanio.com/view/photo/s_ratio_poster/public/p2897873785.jpg']


dict = {'douban':douban_pic_urls,
        'anime': anime_pic_urls}

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
            idx = {}
            for line in f:
                # 处理每一行的内容
                print(line)
                if n == 0 :
                    n = 1
                    continue
                arr = line.replace('"','').replace("'",'').replace("\\","").split(',')
                movie_id = re.sub('[a-zA-Z]',"",arr[0].split(' ')[0] )
                movie_id=movie_id[0:10]
                movie_name=arr[1]
                releasetime = "" if len( arr[18] ) > 4 else arr[18]
                director = arr[5]
                leadactors = arr[3]
                picture = arr[4]
                averating = arr[6] if len(arr[6]) > 0 else '0'
                numrating = arr[7] if len(arr[7]) > 0 else '0'
                description = arr[16]
                typelist = arr[8]
                if  int(movie_id) in idx  :
                    continue
                else : 
                    idx[int(movie_id)] = 1
                if len(picture) < 3 :
                    picture = random.choice(pic_urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)
        if data_type == 'anime' :
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
                typelist = arr[2]
                if  int(movie_id) in idx  :
                    continue
                else :
                    idx[int(movie_id)] = 1

                if len(picture) < 3 :
                    picture = random.choice(pic_urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                # if n > 10 :
                #     break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)
        if data_type == 'food' :
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
                typelist = arr[2]
                if  int(movie_id) in idx  :
                    continue
                else :
                    idx[int(movie_id)] = 1
                
                if len(picture) < 3 :
                    picture = random.choice(pic_urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                # if n > 10 :
                #     break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)

        if data_type == 'book' :
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
                releasetime = "" if len( arr[3] ) > 4 else arr[3] 
                director = arr[2]
                leadactors = ""
                picture = arr[6]
                averating = "0"
                numrating = "0"
                description = ""
                typelist = ""
                if  int(movie_id) in idx  :
                    continue
                else :
                    idx[int(movie_id)] = 1
                
                if len(picture) < 3 :
                    picture = random.choice(pic_urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
                # if n > 10 :
                #     break
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)
	if data_type == 'movielens' :
            # 逐行读取文件内容
            n = 0
            idx = {}
            for line in f:
                # 处理每一行的内容
                arr = line.split('::')
                movie_id = arr[0]
                movie_name=arr[1]
                releasetime = "" 
                director = ""
                leadactors = ""
                picture = ""
                averating = '0'
                numrating = '0'
                description = ""
                typelist = arr[2]
                if  int(movie_id) in idx  :
                    continue
                else : 
                    idx[int(movie_id)] = 1
                if len(picture) < 3 :
                    picture = random.choice(pic_urls)

                insert_sql += "("+  movie_id +",\'" + movie_name +"\',\'" + releasetime+"\',\'" + director +"\',\'" + leadactors +"\',\'" + picture +"\'," + averating +"," + numrating +",\'" + description +"\',\'" + typelist +"\' )\n,"
                n +=1
            insert_sql = insert_sql[0:-1] +";";
            print(insert_sql)
        outfile.write(insert_sql)


insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/douban_movie/movies.csv","douban")
#insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/anime_recommendations/anime.csv","anime")
#insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/food_recommendation/food.csv","food")
#insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/book/Books.csv","book")
#insert_rec_item_sql("/home/hadoop/homework/bigwork/datasets/movielens/movies.dat","movielens")

```
