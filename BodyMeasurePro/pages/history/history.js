// pages/history/history.js
/**
 * History Page: Displays the list of saved measurements.
 * Allows users to view their past (simulated) measurements and clear the history.
 */
Page({
  /**
   * Page initial data.
   * - measurementHistory: Array to store measurement records retrieved from local storage.
   */
  data: {
    measurementHistory: [] // Stores the list of measurement records
  },

  /**
   * Lifecycle function--Called when page show.
   * This is used instead of onLoad because we want the history to refresh
   * every time the page is displayed, in case new measurements were added.
   */
  onShow: function () {
    // console.log('History Page: onShow');
    // Retrieve the 'measurementHistory' from local storage.
    const history = wx.getStorageSync('measurementHistory');
    this.setData({
      measurementHistory: history || [] // If history is null/undefined, default to an empty array.
    });
    // console.log('Loaded history:', this.data.measurementHistory);
  },

  /**
   * Clears all measurement history from local storage and updates the UI.
   * Called when the "Clear History" button is tapped.
   */
  clearHistory: function() {
    // console.log('History Page: clearHistory');
    // Remove the 'measurementHistory' item from local storage.
    wx.removeStorageSync('measurementHistory');

    // Update the page data to reflect the cleared history.
    this.setData({
      measurementHistory: []
    });

    // Show a success toast message.
    wx.showToast({
      title: 'History cleared',
      icon: 'success',
      duration: 1500
    });
  },

  /**
   * Lifecycle function--Called when page load.
   */
  onLoad: function (options) {
    // console.log('History Page: onLoad');
    // Initial load can also be done here, but onShow is better for dynamic updates.
  },

  /**
   * Lifecycle function--Called when page is initially rendered.
   */
  onReady: function () {
    // console.log('History Page: onReady');
  },

  /**
   * Lifecycle function--Called when page hide.
   */
  onHide: function () {
    // console.log('History Page: onHide');
  },

  /**
   * Lifecycle function--Called when page unload.
   */
  onUnload: function () {
    // console.log('History Page: onUnload');
  },

  /**
   * Page event handler function--Called when user drop down.
   * Could be used to implement pull-to-refresh for the history list.
   */
  onPullDownRefresh: function () {
    // console.log('History Page: onPullDownRefresh');
    // this.onShow(); // Reload history
    // wx.stopPullDownRefresh(); // Stop the refresh animation
  },

  /**
   * Called when page reach bottom.
   * Could be used for infinite scrolling if history becomes very large.
   */
  onReachBottom: function () {
    // console.log('History Page: onReachBottom');
  },

  /**
   * Called when user click on the top right corner to share.
   */
  onShareAppMessage: function () {
    // console.log('History Page: onShareAppMessage');
    return {
      title: 'Measurement History - BodyMeasurePro',
      path: '/pages/history/history'
    }
  }
})
