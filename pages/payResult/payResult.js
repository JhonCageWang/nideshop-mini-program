var util = require('../../utils/util.js');
var api = require('../../config/api.js');
const pay = require('../../services/pay.js');

var app = getApp();
Page({
  data: {
    status: false,
    orderId: 0,
    payFlag:true
  },
  onLoad: function (options) {
    options = wx.getStorageSync('orderInfo')
    // 页面初始化 options为页面跳转所带来的参数
    this.setData({
      orderId: options.id,
      status: options.status
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
  payOrder() {
    if (!this.data.payFlag) {
      util.showErrorToast('请勿重复点击')
      return
    } 
    this.setData({
      payFlag:false
    })
    let _that = this
    pay.payOrder(parseInt(this.data.orderId)).then(res => {
      _that.setData({
        status: true,
        payFlag:true
      });
    }).catch(res => {
      _that.setData({
        payFlag:true
      });
      util.showErrorToast('支付失败');
    });
  }
})