# 项目介绍
该项目是一个房卡模式的游戏框架，服务端基于网易游戏框架pomelo的项目，客户端基于cocos-creator

# 服务器
使用pomelo 2.2.5版本
## 环境搭建
### 1.安装nodejs(需要root权限)

    curl --silent --location https://rpm.nodesource.com/setup_5.x | bash -;
    yum install -y nodejs;

这样nodejs和npm就安装好了

### 2.安装需要的工具(需要root权限)
    
#### 1）安装pomelo

    npm install pomelo -g;

#### 2) 安装mysql(使用mysql，考虑到需要支持事务，方便统计数据以及大数据的检索速度)

    TOWRITE

## 启动应用
### 1.使用npm安装依赖文件，会根据package.json文件将所依赖文件下载到node_modules文件夹下。pomelo将这个过程包装在npm-install.*的文件中

    ./npm-install.sh(.bat)

### 2.修改配置文件 config/下面的文件

#### 1） mysql.json

    host,user,password,database表示mysql的地址，登录用户，密码和使用的库名。

#### 2）pomelo使用的配置文件

    其他的都属于pomelo框架使用的配置文件,含义查看
    https://github.com/NetEase/pomelo/wiki/%E5%BA%94%E7%94%A8%E7%A8%8B%E5%BA%8F%E9%85%8D%E7%BD%AE

### 3.启动

    pomelo start;


# 客户端
使用cocos-creator 1.8版本

# 服务器架构说明
目前游戏服务器分为5大部分，gate,connetcor,user,hall,room。
### 1) gate服务器

游戏服务器的第一个入口，只负责负载均衡，即将玩家们平均的分配到多个connector服务器上。到后面版本验证，更新下载等进入游戏前、运算量不大的工作也可以放过来。理论上只有一个，对所有客户端都由这一个入口进入。

### 2) connector服务器

负责管理玩家连接的服务器，处理断开、异常、心跳等工作。管理session，当玩家登录成功后调用enterGame，将玩家id绑定到session上，后续请求hall服务器和room服务器都需要验证session。玩家在所有游戏过程中只和connector服务器连接，请求别的服务器也是有connector服务器进行转发。

### 3) user服务器

负责玩家登录、注册、和第三方sdk交互的服务器，当connector使用rpc调用到user服务器是，不需判断session状态。所有user服务器都是无状态的，所以route的方法可以随即一个user服务器，也可以选择当前压力最小的服务器。

### 4) hall服务器

负责创建、查找、加入一个房间的操作，当玩家成功加入一个房间时，需要将管理这个房间的room服务器的id保存到session中。所有hall服务器也是无状态的，所以route方法也可以随即一个hall服务器。

### 5) room服务器

负责一个房间内具体的游戏规则，坐下、站起、准备、出牌、下注等等。room服务器是有状态的，一个room服务器同时管理一批房间，所以route方法需要在调用room服务器是指定具体的room服务器。

### TODO 
    1.接受第三方主动请求的http服务器，主流第三方支付都有主动请求的过程。
    2.用来统计和后台管理的backend服务器。

![image](https://raw.githubusercontent.com/LubiLiu/Punisky_Pocker/master/res/PunishSky时序图.png)
