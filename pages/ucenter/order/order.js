var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');

Page({
  data: {
    page: 1,
    pageSize: 20,
    hasMoreData: true,
    orderList: [],
    navList: [{
        'id': -1,
        'name': '全部'
      },
      {
        'id': 0,
        'name': '待付款'
      },
      {
        'id': 201,
        'name': '已付款'
      },
      {
        'id': 300,
        'name': '已发货'
      },
      {
        'id': 101,
        'name': '已取消'
      },
      {
        'id': 301,
        'name': '已完成'
      }

    ],
    id: -1
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
    debugger
    util.request(api.OrderList, {
      page: that.data.page,
      size: that.data.pageSize,
      orderStatus: that.data.id
    }).then(function (res) {
      let oldOrderList = that.data.orderList
      if (res.code === 0) {
        wx.hideNavigationBarLoading() //在当前页面隐藏导航条加载动画
        wx.hideLoading()
        console.log(res.data);
        let newOrderList = res.data
        debugger
        if (that.data.page == 1 && newOrderList.length == 0) {
          that.setData({
            orderList: []
          })
          return
        }
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
    this.setData({
      page:1
    })
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
  switchCate: function (event) {
    if (this.data.id == event.currentTarget.dataset.id) {
      return false;
    }
    var that = this;
    var clientX = event.detail.x;
    var currentTarget = event.currentTarget;
    if (clientX < 60) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft - 60
      });
    } else if (clientX > 330) {
      that.setData({
        scrollLeft: currentTarget.offsetLeft
      });
    }
    this.setData({
      id: event.currentTarget.dataset.id
    });
    this.setData({
      page:1
    })
    this.getOrderList();
  }
})