var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    orderId: 0,
    address: {},
    express: {},
    orderInfo: {},
    orderGoods: [],
    handleOption: {}
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id
    });
    this.getOrderDetail();
  },
  getOrderDetail() {
    let that = this;
    util.request(api.OrderDetail, {
      orderId: that.data.orderId
    }).then(function (res) {
      if (res.code === 0) {
        console.log(res.data);
        that.setData({
          orderInfo: res.data,
          orderGoods: res.data.goodsList,
          handleOption: res.data.handleOption,
          address: res.data.address,
          express: res.data.orderExpress
        });
        //that.payTimer();
      }
    });
  },
  payTimer() {
    let that = this;
    let orderInfo = that.data.orderInfo;

    setInterval(() => {
      console.log(orderInfo);
      orderInfo.add_time -= 1;
      that.setData({
        orderInfo: orderInfo,
      });
    }, 1000);
  },
  payOrder() {
    let that = this;
    util.request(api.PayPrepayId, {
      orderId: that.data.orderId || 15
    }).then(function (res) {
      if (res.code === 0) {
        const payParam = res.data;
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            console.log(res)
          },
          'fail': function (res) {
            console.log(res)
          }
        });
      }
    });

  },
  cancelOrder: function () {
    let that = this;
    util.request(api.OrderCancel, {
      orderId: that.data.orderId
    }, "POST").then(function (res) {
      if (res.code === 0) {
        console.log(res.data);
        wx.showToast({
          title: '取消成功',
        })
        setTimeout(function () {
          wx.navigateBack()
        }, 2000)
      }
    });

  },
  onReady: function () {
    // 页面渲染完成
  },
  onShow: function () {
    // 页面显示
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  seeExpress: function () {
    wx.navigateTo({
      url: '/pages/ucenter/express/express?id=' + this.data.orderId,
    })
  }
})