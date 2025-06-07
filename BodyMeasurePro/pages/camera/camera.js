// pages/camera/camera.js
/**
 * Camera Page: Handles camera interaction for capturing images.
 * Users can take a photo which is then passed to the measure page.
 */
Page({
  /**
   * Page initial data.
   */
  data: {
    src: "", // This was for local image preview, now unused as image is passed to measure page.
    devicePosition: 'back' // 'front' or 'back'
  },

  /**
   * Switches between the front and back camera.
   */
  switchCamera() {
    this.setData({
      devicePosition: this.data.devicePosition === 'back' ? 'front' : 'back'
    });
    // console.log('Switched camera to:', this.data.devicePosition);
  },

  /**
   * Lifecycle function--Called when page load.
   * Initializes the camera context.
   */
  onLoad: function (options) {
    // Create a camera context to control the <camera> component.
    this.ctx = wx.createCameraContext();
    // console.log('Camera Page: onLoad');
  },

  /**
   * Captures a photo using the camera.
   * On success, navigates to the 'measure' page, passing the temporary image path.
   * On failure, shows a toast message.
   */
  takePhoto() {
    this.ctx.takePhoto({
      quality: 'high', // Capture high-quality photos
      success: (res) => {
        // console.log('Photo captured:', res.tempImagePath);
        // Navigate to the measure page, passing the captured image's temporary path as a query parameter.
        wx.navigateTo({
          url: '/pages/measure/measure?imagePath=' + res.tempImagePath
        });
      },
      fail: (err) => {
        console.error('Photo capture failed:', err);
        wx.showToast({
          title: 'Capture Failed',
          icon: 'none',
          duration: 2000
        });
      }
    });
  },

  /**
   * Handles errors from the <camera> component.
   * @param {Object} e - The error event object from the camera component.
   */
  error(e) {
    console.error('Camera error:', e.detail);
    wx.showToast({
      title: 'Camera Error',
      icon: 'none',
      duration: 2000
    });
  },

  /**
   * Lifecycle function--Called when page is initially rendered.
   */
  onReady: function () {
    // console.log('Camera Page: onReady');
  },

  /**
   * Lifecycle function--Called when page show.
   */
  onShow: function () {
    // console.log('Camera Page: onShow');
  },

  /**
   * Lifecycle function--Called when page hide.
   */
  onHide: function () {
    // console.log('Camera Page: onHide');
  },

  /**
   * Lifecycle function--Called when page unload.
   */
  onUnload: function () {
    // console.log('Camera Page: onUnload');
  },

  /**
   * Page event handler function--Called when user drop down.
   */
  onPullDownRefresh: function () {
    // console.log('Camera Page: onPullDownRefresh');
  },

  /**
   * Called when page reach bottom.
   */
  onReachBottom: function () {
    // console.log('Camera Page: onReachBottom');
  },

  /**
   * Called when user click on the top right corner to share.
   */
  onShareAppMessage: function () {
    // console.log('Camera Page: onShareAppMessage');
    return {
      title: 'Capture Measurement Photo - BodyMeasurePro',
      path: '/pages/camera/camera'
    }
  }
})
