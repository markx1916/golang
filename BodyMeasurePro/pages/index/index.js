// pages/index/index.js
/**
 * Index Page: The main entry point of the application.
 * Provides navigation to the camera page for starting measurements and to the history page.
 */
Page({
  /**
   * Page initial data.
   * Not much data is needed for this simple static navigation page.
   */
  data: {},

  /**
   * Navigates to the camera page.
   * Called when the "Start Measurement" button is tapped.
   */
  goToCamera: function() {
    wx.navigateTo({
      url: '/pages/camera/camera' // Path to the camera page
    });
  },

  /**
   * Navigates to the history page.
   * Called when the "View History" button is tapped.
   */
  goToHistory: function() {
    wx.navigateTo({
      url: '/pages/history/history' // Path to the history page
    });
  },

  /**
   * Lifecycle function--Called when page load.
   */
  onLoad: function(options) {
    // console.log('Index Page: onLoad');
  },

  /**
   * Lifecycle function--Called when page is initially rendered.
   */
  onReady: function() {
    // console.log('Index Page: onReady');
  },

  /**
   * Lifecycle function--Called when page show.
   */
  onShow: function() {
    // console.log('Index Page: onShow');
  },

  /**
   * Lifecycle function--Called when page hide.
   */
  onHide: function() {
    // console.log('Index Page: onHide');
  },

  /**
   * Lifecycle function--Called when page unload.
   */
  onUnload: function() {
    // console.log('Index Page: onUnload');
  },

  /**
   * Page event handler function--Called when user drop down.
   */
  onPullDownRefresh: function() {
    // console.log('Index Page: onPullDownRefresh');
  },

  /**
   * Called when page reach bottom.
   */
  onReachBottom: function() {
    // console.log('Index Page: onReachBottom');
  },

  /**
   * Called when user click on the top right corner to share.
   */
  onShareAppMessage: function() {
    // console.log('Index Page: onShareAppMessage');
    return {
      title: 'BodyMeasurePro',
      path: '/pages/index/index'
    }
  }
});
