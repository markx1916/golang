// pages/measure/measure.js
/**
 * Measure Page: Displays the captured image and allows users to trigger
 * simulated body measurements. Results are displayed and saved to local history.
 */
Page({
  /**
   * Page initial data.
   * - imagePath: Path to the captured image, passed from the camera page.
   * - measurementResult: String to display the latest measurement result.
   */
  data: {
    imagePath: '',          // Stores the path of the image captured by the camera
    measurementResult: ''   // Stores the string representation of the latest measurement
  },

  /**
   * Lifecycle function--Called when page load.
   * Retrieves the imagePath from the navigation options.
   * If no imagePath is found, logs an error and shows a toast.
   * @param {Object} options - Options passed during navigation, expecting options.imagePath.
   */
  onLoad: function (options) {
    // console.log('Measure Page: onLoad', options);
    if (options.imagePath) {
      this.setData({
        imagePath: options.imagePath
      });
    } else {
      console.error("No imagePath passed to measure page");
      wx.showToast({
        title: 'Error: No image',
        icon: 'none',
        duration: 2000
      });
      // Optionally, navigate back if no image is provided,
      // or display a placeholder image.
      // wx.navigateBack();
    }
  },

  /**
   * Saves a measurement to local storage and updates the UI.
   * @param {string} type - The type of measurement (e.g., 'Chest', 'Waist').
   * @param {string} value - The simulated measurement value (e.g., '90cm (Simulated)').
   */
  saveMeasurement: function(type, value) {
    // Retrieve existing history or initialize an empty array if none exists.
    let history = wx.getStorageSync('measurementHistory') || [];

    const newMeasurement = {
      type: type,                         // e.g., "Chest"
      value: value,                       // e.g., "90cm (Simulated)"
      timestamp: new Date().toISOString() // ISO string format for the current time
    };

    // Add the new measurement to the beginning of the history array.
    history.unshift(newMeasurement);

    // Save the updated history array back to local storage.
    wx.setStorageSync('measurementHistory', history);

    // Update the page data to display the current measurement result.
    this.setData({
      measurementResult: `${type}: ${value}`
    });
    // console.log('Measurement saved:', newMeasurement);
  },

  /**
   * Simulates measuring the chest.
   * IMPORTANT: This is a placeholder and does not perform actual image analysis.
   */
  measureChest: function() {
    this.saveMeasurement('Chest', '90cm (Simulated)');
  },

  /**
   * Simulates measuring the waist.
   * IMPORTANT: This is a placeholder and does not perform actual image analysis.
   */
  measureWaist: function() {
    this.saveMeasurement('Waist', '75cm (Simulated)');
  },

  /**
   * Simulates measuring the hip.
   * IMPORTANT: This is a placeholder and does not perform actual image analysis.
   */
  measureHip: function() {
    this.saveMeasurement('Hip', '95cm (Simulated)');
  },

  /**
   * Simulates measuring the neck.
   * IMPORTANT: This is a placeholder and does not perform actual image analysis.
   */
  measureNeck: function() {
    this.saveMeasurement('Neck', '38cm (Simulated)');
  },

  /**
   * Lifecycle function--Called when page is initially rendered.
   */
  onReady: function () {
    // console.log('Measure Page: onReady');
  },

  /**
   * Lifecycle function--Called when page show.
   */
  onShow: function () {
    // console.log('Measure Page: onShow');
  },

  /**
   * Lifecycle function--Called when page hide.
   */
  onHide: function () {
    // console.log('Measure Page: onHide');
  },

  /**
   * Lifecycle function--Called when page unload.
   */
  onUnload: function () {
    // console.log('Measure Page: onUnload');
  },

  /**
   * Page event handler function--Called when user drop down.
   */
  onPullDownRefresh: function () {
    // console.log('Measure Page: onPullDownRefresh');
  },

  /**
   * Called when page reach bottom.
   */
  onReachBottom: function () {
    // console.log('Measure Page: onReachBottom');
  },

  /**
   * Called when user click on the top right corner to share.
   */
  onShareAppMessage: function () {
    // console.log('Measure Page: onShareAppMessage');
    return {
      title: 'Simulated Body Measurement - BodyMeasurePro',
      path: `/pages/measure/measure?imagePath=${this.data.imagePath}` // Share with current image
    }
  }
})
