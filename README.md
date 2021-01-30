# wx-mqtt
这是一个连接MQTT的小程序客户端，
个人在开发物联网项目中，用到了MQTT，就写了一个简单的连接MQTT的模板
小程序连接MQTT主要通过MQTTJS进行连接
连接MQTT需要连接ID，连接账号，连接密码

# 注意事项
这是连接阿里云的MQTT服务器，所以你需要在你的阿里云上，搭建MQTT服务

# 连接ID clientId
clientId：由 groupId @@@ deviceId 组成
groupId：阿里云后台获取
deviceId：是自定义的设备ID

# 连接账号 username
username：由Signature | accessKey | instanceId
Signature：是字符串'Signature'
accessKey：阿里云后台获取
instanceId：实例ID，阿里云后台获取

# 连接密码 password
password：由 clientId 和 secretKey 通过 CryptoJS 加密生成
clientId：由 groupId @@@ deviceId 组成
secretKey：阿里云后台获取
加密：CryptoJS.HmacSHA1(clientId,secretKey).toString(CryptoJS.enc.Base64) 

# 连接
第一步：获取到连接ID，连接账号，连接密码
第二步：创建MQTT实例
第三步：设置MQTT配置
第四步：连接MQTT
第五步：订阅主题

# 发送一对多消息
var message = new MQTT.Message('这是一对多消息');
message.destinationName = 消息主题;
client.send(message)

# 发送一对一消息
var message = new MQTT.Message('这是一对一消息');
message.destinationName = 消息主题 + "/p2p/" + clientId;
client.send(message)
