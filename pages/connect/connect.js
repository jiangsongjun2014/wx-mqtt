
var MQTT = require("../../utils/paho-mqtt.js");
var CryptoJS = require('../../utils/crypto.js')

Page({

  data: {
    // MQTT服务器地址
    server_addr: '',
    // instanceId，实例ID，用于生成账号，阿里云后台获取
    instanceId: '',
    // accessKey，用于生成账号，阿里云后台获取
    accessKey: '',
    // secretKey，用于生成密码，阿里云后台获取
    secretKey: '',
    // groupId，用于生成连接ID，阿里云后台获取
    groupId: '',
    // deviceId，用于生成连接ID，自己自定义
    deviceId: '',
    // clientId，连接ID，由 groupId @@@ deviceId 组成
    clientId: '',
    // username，连接账号，由Signature | accessKey | instanceId
    username: '',
    // password，连接密码，由clientId 和 secretKey加密生成
    password: '',
    // 消息主题
    topic: '',
    // 连接的MQTT实例
    client: ''
  },

  // 第一步：获取deviceId，生成clientId
  getClientId (e) {
    var deviceId = e.detail.value 
    var clientId = this.data.groupId + deviceId
    this.setData({ 
      clientId: clientId, 
      deviceId: deviceId 
    })
  },

  // 第二步：获取连接账户和连接密码
  getClientInfo(){
    if (this.data.clientId == '') {
      wx.showToast({title: '请输入设备id', icon: 'none'})
    } else {
      var username = 'Signature' + '|'+ this.data.accessKey + '|' + this.data.instanceId
      var password = CryptoJS.HmacSHA1(this.data.clientId, this.data.secretKey).toString(CryptoJS.enc.Base64) 
      this.setData({ 
        username: username, 
        password: password 
      })
      wx.showToast({ title: '生成成功' })
    }
  },

  // 第三步：连接MQTT
  handleClientConnect(){
    var that = this

    // 判断id
    if (that.data.clientId == '') {
      wx.showToast({ title: '请输入设备id', icon: 'none' })
      return
    } 
    
    // 判断账号密码
    if (that.data.username == '' && that.data.password == '') {
      wx.showToast({ title: '请生成账号', icon: 'none' })
      return
    } 

    // 创建MQTT
    var client = new MQTT.Client(
      "wss://" + that.data.server_addr + "/mqtt", 
      that.data.clientId
    );
    
    // 链接配置
    var connectOptions = {
      timeout: 10,
      useSSL: true,
      cleanSession: true,
      keepAliveInterval: 30,
      reconnect: true,
      userName: that.data.username,
      password: that.data.password,
      onSuccess: function () {
        console.log('链接成功');
        wx.showToast({ title: '连接成功' })
        // 订阅主题
        client.subscribe(that.data.topic, {qos: 0})
      },
      onFailure: function (error) {
        console.log('连接失败：' + JSON.stringify(error));
      }
    };

    // 监听消息
    client.onMessageArrived = that.getClientArrived

    // 监听丢失
    client.onConnectionLost = that.getClientLost 

    // 连接MQTT
    client.connect(connectOptions);
    that.setData({ client: client })

  },

  // 监听消息
  getClientArrived(message){
    console.log('接收主题：' + message.destinationName + '的消息：' + message.payloadString)
  },

  // 监听丢失
  getClientLost(error){
    console.log('连接丢失：'+ JSON.stringify(error))
  },

  // 发送一对一消息
  handleClientSendOne(){
    if (this.data.client == '') {
      wx.showToast({ title: '请连接MQTT', icon: 'none' })
    } else {
      var message = new MQTT.Message('这是一对一消息');
      message.destinationName = this.data.topic + "/p2p/" + this.data.clientId;
      this.data.client.send(message)
      wx.showToast({ title: '发送成功' })
    }
  },

  // 发送一对多消息
  handleClientSendMore(){
    if (this.data.client == '') {
      wx.showToast({ title: '请连接MQTT', icon: 'none' })
    } else {
      var message = new MQTT.Message('这是一对多消息');
      message.destinationName = this.data.topic;
      this.data.client.send(message)
      wx.showToast({ title: '发送成功' })
    }
  },

  
})