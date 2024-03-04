var app = getApp();
var util = require('../../utils/util.js');
var api = require('../../config/api.js');

Page({
  data: {
    orderId: 0,
    actualPrice: 0.00,
    payFlag:true
  },
  onLoad: function (options) {
    options = wx.getStorageSync('orderInfo')
    debugger
    console.log('ddd', options)
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id,
      actualPrice: options.actualPrice
    })
  },
  onReady: function () {

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
  //向服务请求支付参数
  requestPayParam() {
    let that = this;
    util.request(api.PayPrepayId, {
      orderId: that.data.orderId,
      payType: 1
    }).then(function (res) {
      if (res.code === 0) {
        let payParam = res.data;
        that.setData({
          payFlag:true
        })
        wx.requestPayment({
          'timeStamp': payParam.timeStamp,
          'nonceStr': payParam.nonceStr,
          'package': payParam.package,
          'signType': payParam.signType,
          'paySign': payParam.paySign,
          'success': function (res) {
            wx.getSetting({
              withSubscriptions: true, // 是否获取用户订阅消息的订阅状态，默认false不返回
              success(res) {
                console.log('res.authSetting', res.authSetting)
                if (res.authSetting['scope.subscribeMessage']) {
                  console.log('用户点击了“总是保持以上，不再询问”')
                } else {
                  console.log('用户没有点击“总是保持以上，不再询问”则每次都会调起订阅消息')
                  //因为没有选择总是保持，所以需要调起授权弹窗再次授权
                  wx.requestSubscribeMessage({
                    tmplIds: ['W1vgYsb12MPxHNd_BqnOxr5YShAi0YrDk4dUZRbijps', 'cvzt9dvzVGgcqsSAl7hCP-PmXwZdGQpMpMCnuYhUYd0'],
                    success(res) {
                      wx.redirectTo({
                        url: '/pages/payResult/payResult?status=true',
                      })
                    }
                  })
                }

              }
            })

          },
          'fail': function (res) {
            wx.redirectTo({
              url: '/pages/payResult/payResult?status=false',
            })
          }
        })
      } else {
        wx.showToast({
          image: '/static/images/icon_error.png',
          title: res.msg,
          mask: true
        });
        setTimeout(function () {
          wx.navigateBack()
        }, 2000)

      }
    });
  },
  startPay() {
    if (!this.data.payFlag) {
      util.showErrorToast('请勿重复点击')
      return
    }
    this.setData({
      payFlag:false
    })
    this.requestPayParam();
  }
})