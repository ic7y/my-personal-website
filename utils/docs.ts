export type DocItem = {
  key: string
  title: string
  file: string
  description?: string
}

export type CourseItem = {
  key: string
  title: string
  description: string
  docs: DocItem[]
}

export const docsCourses: CourseItem[] = [
  {
    key: 'company-road',
    title: '互联网公司职场之路',
    description: '浏览企业职业发展、求职经验和职场规划文档。',
    docs: [
      { key: 'company-road', title: '互联网公司职场之路', file: 'company-road.md' }
    ]
  },
  {
    key: 'bigdata-apply',
    title: '大数据技术及应用',
    description: '大数据技术课程材料与作业说明。',
    docs: [
      { key: 'bigdata-analysis', title: '项目大作业说明', file: 'bigdata-apply/bigdata-analysis.md' },
      
      { key: 'bigdata-ana-1', title: '项目大作业工程', file: 'bigdata-apply/bigdata-ana-1.md' },
      
    ]
  },
  {
    key: 'bigdata-project',
    title: '大数据分析项目实践',
    description: '按实验组织的实践内容，每个实验对应一个 Markdown 文档。',
    docs: [
      { key: 'sbt', title: 'sbt配置', file: 'bigdata-project/sbt.md' },
      { key: 'hdfs-cmd', title: '实验1：hdfs常用命令', file: 'bigdata-project/hdfs-cmd.md' },
      { key: 'exp1-linux-cmd', title: '实验2：Linux 使用', file: 'bigdata-project/exp2-linux-cmd.md' },
      { key: 'exp3-mysql', title: '实验3：MySQL 使用', file: 'bigdata-project/exp3-mysql.md' },
      { key: 'exp4-hadoop', title: '实验4：Hadoop 安装与使用', file: 'bigdata-project/exp4-hadoop.md' },
      { key: 'exp5-spark-install', title: '实验5：Spark 安装与使用', file: 'bigdata-project/exp5-spark-install.md' },
      { key: 'exp6-spark-shell', title: '实验6：Spark Shell 使用', file: 'bigdata-project/exp6-spark-shell.md' },
      { key: 'exp7-idea-install', title: '实验7：IDEA 安装与配置', file: 'bigdata-project/exp7-idea-install.md' },
      { key: 'exp8-spark-sample', title: '实验8：Spark 工程搭建', file: 'bigdata-project/exp8-spark-sample.md' },
      { key: 'exp9-spark-mysql', title: '实验9：Spark 读写 MySQL', file: 'bigdata-project/exp9-spark-mysql.md' },
      { key: 'exp10-cf', title: '实验10：协同过滤算法', file: 'bigdata-project/exp10-cf.md' },
      { key: 'exp11-nodejs-install', title: '实验11：Node.js 安装', file: 'bigdata-project/exp11-nodejs-install.md' },
      { key: 'exp12-nodejs-sample', title: '实验12：Node.js 简单网页实现', file: 'bigdata-project/exp12-nodejs-sample.md' },
      { key: 'wordcount', title: '实验13：Spark WordCount 示例', file: 'bigdata-project/wordcount.md' },
      { key: 'spark-ml-cf', title: '实验14：Spark ML 推荐系统', file: 'bigdata-project/spark-ml-cf.md' },
      { key: 'spark-mllib', title: '实验15：Spark MLLib 示例', file: 'bigdata-project/spark-mllib.md' },
      { key: 'bigdata-homework', title: '课程大作业要求', file: 'bigdata-project/bigdata_homework.md' },
      { key: 'movie-rec', title: '推荐系统课程大作业-说明', file: 'bigdata-project/movie_rec.md' },
      { key: 'movie-rec', title: '推荐系统课程大作业--配置', file: 'bigdata-project/movie_rec.md' }
    ]
  },
  {
    key: 'software-data-engineering',
    title: '软件/数据工程',
    description: '软件工程习题',
    docs: [
      { key: 'software', title: '软件工程', file: 'software-data-engineering/software.md' }
    ]
  },
  {
    key: 'c++',
    title: '面向对象程序设计',
    description: 'C++ 习题',
    docs: [
      { key: 'c++', title: '面向对象程序设计', file: 'c++/c++.md' }
    ]
  },
  {
    key: 'competitions',
    title: '比赛',
    description: '竞赛相关资料与心得。',
    docs: [
      { key: 'competitions', title: '比赛', file: 'competitions/competitions.md' }
    ]
  }
]

export const docsCourseMap: Record<string, CourseItem> = Object.fromEntries(
  docsCourses.map((course) => [course.key, course])
)

export function getCourse(courseKey: string) {
  return docsCourseMap[courseKey] || null
}

export function getDoc(courseKey: string, docKey: string) {
  const course = getCourse(courseKey)
  return course?.docs.find((item) => item.key === docKey) || null
}
