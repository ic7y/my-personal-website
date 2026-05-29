<style>
pre {
    overflow-y :auto;
    max-height : 500px;
}
</style>


# hdfs 常用命令
## linux 常用命令
```shell
cd  xxx   # 进入某个目录xxx
cp  src_file dist_file  # copy src_file 到 dist_file   ， 可用于文件也可以用于目录
mv  src_file dist_file  # 修改名称or移动位置 ，  可以把 src_file 移动到 dist_file，且改名。
rm  {-r} xxx # 删除文件， 前面 -r 可选，表示递归删除 目录下的所有文件
vi/vim/gedit  xxx  # 用编辑器 vi or vim or gedit  修改文件xxx内容。   

tips: 在查找文件或目录的过程中， 但凡命令里有需要 文件或目录的地方， 都可以用tab 键 
来联想提示可能要输入的名称。联想的规则是，以你输入字符为前缀的目录下查找。多按几次tab，可以再候选项之间切换。
```
## 定义 hdfs 命令的别名
> 起别名是因为 原始的命令往往 很长，有些还要带 命令文件所在的路径， 起个别名就是方便快速的输入。
```shell
vi  ~/.bashrc
# 在文件的最后 加上 以下代码。
alias hfs='/usr/local/hadoop-2.7.1/bin/hdfs dfs'
#保存退出后， 执行
source ~/.bashrc   # 使刚才的命令生效，下次再打开 命令行客户端后，这个文件会自动被执行。

```
## hdfs常用命令 
```shell
hfs -ls  xxx  # 查看某路径下文件列表
hfs -put  aaa bbb   # 将本地某路径下的文件aaa，上传到hdfs 的某个路径bbb下。
hfs -mkdir xxx   # 在hdfs的上增加xxx 的目录。
hfs -get bbb aaa   # 将hfds 上某路径的数据bbb ， 下载到本地的 路径aaa 上。
hfs -getmerge bbb aaa # 将hfds 上某目录下的数据bbb， 合并成1个文件 下载到本地路径 aaa 上。
hfs -cat bbb  # 查看 hdfs 上bbb 文件的内容。
hfs -rmr bbb # 删除 hdfs 上 路径bbb 下的所有数据。
````
#  other  cmd 
