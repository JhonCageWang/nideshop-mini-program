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

    // this.getOrderList();
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
      page: that.data.page,
      size: that.data.pageSize,
      orderStatus: that.data.id
    }).then(function (res) {
      let oldOrderList = that.data.orderList
      if (res.code === 0) {
        wx.hideNavigationBarLoading() //在当前页面隐藏导航条加载动画
        wx.hideLoading()
        let newOrderList = res.data
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
  onShow: function (options) {
    debugger
    if (options && wx.openBusinessView && thismerchant_id && merchant_trade_no) {
    var merchant_id =  options.merchant_id
    var merchant_trade_no = options.merchant_trade_no
    console.log('logOptionOrder'+options);
      wx.openBusinessView({
        businessType: 'weappOrderConfirm',
        extraData: {
          merchant_id: merchant_id,//用户交易商户号
          merchant_trade_no: merchant_trade_no,//商户订单号
    // 　　　transaction_id: "4200001918202309184260377001" //用户交易单号
        },
        success:e=>{
          console.log("e1",e)
          this.orderSn = sn
          if(e.extraData.status === 'success'){
            // 用户确认收货成功，再执行自己的代码
            wx.showToast({
              title: "确认收货成功!",
              icon: "none",
            });
            this.confirmRog()
          }else if(e.extraData.status === 'fail'){
            // 用户确认收货失败
            wx.showToast({
              title: "确认收货失败!",
              icon: "none",
            });
          }else if(e.extraData.status === 'cancel'){
            // 用户取消
            wx.showToast({
              title: "取消确认收货!",
              icon: "none",
            });
          }
        },
        fail:e=>{
          console.log("e2",e)
          wx.showToast({
            title: "确认收货失败",
            icon: "none",
          });
        },
        complete:e=>{
          console.log("e3",e)
          console.log("无论是否成功都会执行")
        }
      });
    } else {
      //引导用户升级微信版本
      wx.showToast({
        title: "请升级微信版本",
        icon: "none",
      });
    }
    this.getOrderList();
  },
  onHide: function () {
    // 页面隐藏
  },
  onUnload: function () {
    // 页面关闭
  },
  onUnload: function () {
    // 页面关闭
  },
  onPullDownRefresh: function () {
    this.setData({
      page: 1
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
      page: 1
    })
    this.getOrderList();
  }
})