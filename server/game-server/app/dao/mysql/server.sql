# ------------------------------------------------用户数据相关------------------------------------------------
# Dump of table User
# ------------------------------------------------------------
DROP TABLE IF EXISTS `User`;
CREATE TABLE `User` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '用户唯一id',
  `name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '用户名称',
  `head` VARCHAR(256) NOT NULL DEFAULT '' COMMENT '用户头像url',
  `phone` VARCHAR(11) NOT NULL DEFAULT '' COMMENT '手机号码',
  `password` VARCHAR(60) DEFAULT NULL COMMENT '用户密码',
  `token` VARCHAR(512) DEFAULT '' COMMENT '验证token',
  `logintime` bigint(20) unsigned DEFAULT '0' COMMENT '登陆时间',
  `createtime` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
  PRIMARY KEY (`id`),
  UNIQUE  KEY (`phone`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='用户表';

DROP TABLE IF EXISTS `ThirdPartUser`;
CREATE TABLE `ThirdPartUser` (
  `userid` INT NOT NULL COMMENT '用户唯一id',
  `method` INT NOT NULL COMMENT '第三方登录类型',
  `openid` VARCHAR(128) NOT NULL COMMENT '第三方用户id',
  UNIQUE KEY `UNIQUE_BINDING` (`method`,`openid`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='第三方用户关联表';

# Dump of table Currency
# ------------------------------------------------------------
DROP TABLE IF EXISTS `Currency`;
CREATE TABLE `Currency` (
  `userid` INT NOT NULL COMMENT '用户唯一id',
  `type` INT NOT NULL COMMENT '货币类型',
  `value` BIGINT NOT NULL COMMENT '货币值',
  UNIQUE KEY `UNIQUE_BINDING` (`userid`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='货币表';

# Dump of table Validation
# ------------------------------------------------------------
DROP TABLE IF EXISTS `Validation`;
CREATE TABLE `Validation` (
  `phone` VARCHAR(11) NOT NULL DEFAULT '' COMMENT '手机号码',
  `type` INT NOT NULL COMMENT '验证类型',
  `value` VARCHAR(10) NOT NULL DEFAULT '' COMMENT '验证码',
  `createTime` bigint(20) unsigned DEFAULT '0' COMMENT '生成时间',
  UNIQUE KEY `UNIQUE_BINDING` (`phone`,`type`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='验证码表';


# ------------------------------------------------游戏房间相关------------------------------------------------
# Dump of table Room
# ------------------------------------------------------------
DROP TABLE IF EXISTS `Room`;
CREATE TABLE `Room` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '房间id',
  `type` INT NOT NULL COMMENT '房间类型',
  `name` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '房间名称',
  `invitecode` VARCHAR(8) NOT NULL DEFAULT '' COMMENT '邀请码',
  `serverid` VARCHAR(32) NOT NULL DEFAULT '' COMMENT '服务器id',
  `creatorid` INT NOT NULL COMMENT '创建者',
  `creatorname` VARCHAR(64) NOT NULL DEFAULT '' COMMENT '创建者名称',
  `timeout` bigint(20) unsigned DEFAULT 0 COMMENT '过期时间',
  `createTime` bigint(20) unsigned DEFAULT '0' COMMENT '生成时间',
   PRIMARY KEY (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='房间表';

# Dump of table TexasRule 得克萨斯的房间规则  #TODO
# ------------------------------------------------------------
DROP TABLE IF EXISTS `TexasRule`;
CREATE TABLE `TexasRule` (
  `id` INT NOT NULL COMMENT '房间id',
  `bringIn` INT NOT NULL COMMENT '带入金额',
  `minBet` INT NOT NULL COMMENT '最小下注',
  `createTime` bigint(20) unsigned DEFAULT '0' COMMENT '生成时间',
   PRIMARY KEY (`id`),
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='得克萨斯的房间规则';

# Dump of table TexasGamer 得克萨斯玩家信息  #TODO
# ------------------------------------------------------------
DROP TABLE IF EXISTS `TexasGamer`;
CREATE TABLE `TexasGamer` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '房间id',
  `uid` INT NOT NULL COMMENT '玩家id',
  `createTime` bigint(20) unsigned DEFAULT '0' COMMENT '生成时间',
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='得克萨斯的房间规则';

# Dump of table TexasTable 得克萨斯牌桌信息  #TODO
# ------------------------------------------------------------
DROP TABLE IF EXISTS `TexasTable`;
CREATE TABLE `TexasTable` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '房间id',
  `createTime` bigint(20) unsigned DEFAULT '0' COMMENT '生成时间',
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='得克萨斯的房间规则';

# Dump of table TexasSite 得克萨斯座位信息  #TODO
# ------------------------------------------------------------
DROP TABLE IF EXISTS `TexasSeat`;
CREATE TABLE `TexasSeat` (
  `id` INT NOT NULL AUTO_INCREMENT COMMENT '房间id',
  `createTime` bigint(20) unsigned DEFAULT '0' COMMENT '生成时间',
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COMMENT='得克萨斯的房间规则';