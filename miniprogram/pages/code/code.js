// miniprogram/pages/code/code.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moneyCurrent: '',
    _pay: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  },

  clear() {
    wx.hideLoading();
    this.setData({
      moneyCurrent: '',
      _pay: false
    });
    this.data._saving = false;
  },

  keyboardChangeHandler(e) {
    this.setData({
      moneyCurrent: e.detail.value.current,
      _pay: !!e.detail.value.current,
    });
  },

  keyboardConfirmHandler(e) {
    if (!this.data._pay || this.data._saving || this.data.moneyCurrent === undefined || this.data.moneyCurrent === '') return;
    this.data._saving = true;

    wx.showLoading({
      title: '验证中',
    })

    setTimeout(()=>{
      this.clear();
    }, 1000);

  }
})