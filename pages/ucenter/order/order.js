var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    page: 1,
    pageSize: 20,
    hasMoreData: true,
    orderList: []
  },
  onLoad: function (options) {
    // 页面初始化 options为页面跳转所带来的参数

    this.getOrderList();
  },
  getOrderList() {
    //在当前页面显示导航条加载动画
    wx.showNavigationBarLoading()
    //显示 loading 提示框             
    wx.showLoading({
      title: '正在加载'
    })
    let that = this;
    util.request(api.OrderList, {
      page: this.data.page,
      size: this.data.pageSize
    }).then(function (res) {
      let oldOrderList = that.data.orderList
      if (res.code === 0) {
        wx.hideNavigationBarLoading() //在当前页面隐藏导航条加载动画
        wx.hideLoading()
        console.log(res.data);
        let newOrderList = res.data
        if (newOrderList.length == 0) {
          that.setData({
            hasMoreData: false
          })
        } else {
          if (newOrderList.length > 0) {
            if (that.data.page == 1) {
              oldOrderList = []
            }
            if (newOrderList.length < that.data.pageSize) {
              that.setData({
                orderList: oldOrderList.concat(newOrderList),
                hasMoreData: false
              })
            } else {
              that.setData({
                orderList: oldOrderList.concat(newOrderList),
                hasMoreData: true,
                page: that.data.page + 1
              })
            }
          }
        }

      }
    })
  },
  payOrder(e) {
    wx.setStorageSync('orderInfo', this.data.orderList[e.target.dataset.orderIndex])
    wx.navigateTo({
      url: '/pages/pay/pay'
    })
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
  onPullDownRefresh: function () {
    this.data.page = 1
    this.getOrderList()
  },
  onReachBottom: function () {
    if (this.data.hasMoreData) {
      this.getOrderList()
    } else {
      wx.showToast({
        title: '没有更多数据',
      })
    }
  },
})