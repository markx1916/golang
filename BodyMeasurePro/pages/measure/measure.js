// pages/measure/measure.js
/**
 * Measure Page: Displays the captured image on a canvas and allows users to trigger
 * simulated body measurements with visual indicators. Results are displayed and saved.
 */
const app = getApp(); // Get the app instance

Page({
  /**
   * Page initial data.
   */
  data: {
    imagePath: '',
    measurementResult: '',
    lang: {},
    imageLoaded: false, // Flag to enable measurement buttons
    originalImageWidth: 0,  // Original width of the loaded image
    originalImageHeight: 0, // Original height of the loaded image
    canvasDrawWidth: 300,   // Calculated width for drawing image on canvas (maintaining aspect ratio)
    canvasDrawHeight: 400,  // Calculated height for drawing image on canvas (maintaining aspect ratio)
    canvasOffsetX: 0,       // X-offset for centering image on canvas
    canvasOffsetY: 0,       // Y-offset for centering image on canvas
    lastMeasurementTypeKey: null, // Stores the typeKey of the last measurement for re-localization
    lastMeasurementRawValue: null // Stores the raw value of the last measurement for re-localization
  },
  canvasCtx: null, // Stores the canvas rendering context

  /**
   * Lifecycle function--Called when page load.
   */
  onLoad: function (options) {
    this.canvasCtx = wx.createCanvasContext('measureCanvas');
    if (options.imagePath) {
      // this.setData({ imagePath: options.imagePath }); // Store imagePath - path is in this.data.imagePath
      this.loadImageOntoCanvas(options.imagePath);
    } else {
      console.error("No imagePath passed to measure page");
      const errTitle = (app.globalData.locales && app.globalData.locales.measure_error_no_image_toast)
                       ? app.globalData.locales.measure_error_no_image_toast
                       : 'Error: No image';
      wx.showToast({ title: errTitle, icon: 'none', duration: 2000 });
    }
  },

  /**
   * Loads the captured image onto the canvas.
   * Calculates dimensions to fit the image while maintaining aspect ratio.
   * @param {string} path - The file path of the image to load.
   */
  loadImageOntoCanvas(path) {
    const ctx = this.canvasCtx;

    // Get actual canvas dimensions from the DOM for accurate calculations
    wx.createSelectorQuery().select('#measureCanvas').boundingClientRect(rect => {
      if (!rect) {
        console.error("Canvas element not found for sizing.");
        wx.showToast({ title: 'Canvas Error', icon: 'none'}); // Consider localizing this
        return;
      }
      const canvasActualDisplayWidth = rect.width;
      const canvasActualDisplayHeight = rect.height;

      wx.getImageInfo({
        src: path,
        success: (res) => {
          let drawWidth, drawHeight, offsetX = 0, offsetY = 0;
          const imgAspectRatio = res.width / res.height;
          const canvasAspectRatio = canvasActualDisplayWidth / canvasActualDisplayHeight;

          if (imgAspectRatio > canvasAspectRatio) {
            drawWidth = canvasActualDisplayWidth;
            drawHeight = canvasActualDisplayWidth / imgAspectRatio;
            offsetY = (canvasActualDisplayHeight - drawHeight) / 2;
          } else {
            drawHeight = canvasActualDisplayHeight;
            drawWidth = canvasActualDisplayHeight * imgAspectRatio;
            offsetX = (canvasActualDisplayWidth - drawWidth) / 2;
          }

          this.setData({
            originalImageWidth: res.width, originalImageHeight: res.height,
            canvasDrawWidth: drawWidth, canvasDrawHeight: drawHeight,
            canvasOffsetX: offsetX, canvasOffsetY: offsetY,
            imagePath: path // Ensure imagePath is set in data for redraws
          });

          ctx.drawImage(path, offsetX, offsetY, drawWidth, drawHeight);
          ctx.draw();
          this.setData({ imageLoaded: true });
        },
        fail: (err) => {
          console.error("Failed to get image info:", err);
          // Consider localizing this toast
          wx.showToast({ title: 'Failed to load image', icon: 'none' });
        }
      });
    }).exec();
  },

  /**
   * Helper function to draw a single horizontal measurement line on the canvas.
   * It first redraws the base image to clear any previous lines.
   * Line coordinates are relative to the drawn image's position and size on the canvas.
   * @param {number} yFactor - Percentage down the drawn image height where the line should be placed (0.0 to 1.0).
   * @param {number} xWidthFactorStart - Percentage from the left of the drawn image width where the line starts.
   * @param {number} xWidthFactorEnd - Percentage from the left of the drawn image width where the line ends.
   */
  _drawMeasurementLine(yFactor, xWidthFactorStart = 0.1, xWidthFactorEnd = 0.9) {
    if (!this.data.imageLoaded) return;
    const ctx = this.canvasCtx;

    // Redraw the base image to clear any previously drawn lines
    ctx.drawImage(this.data.imagePath, this.data.canvasOffsetX, this.data.canvasOffsetY, this.data.canvasDrawWidth, this.data.canvasDrawHeight);

    // Calculate line position relative to the drawn image on the canvas
    const yPos = this.data.canvasOffsetY + this.data.canvasDrawHeight * yFactor;
    const xStart = this.data.canvasOffsetX + this.data.canvasDrawWidth * xWidthFactorStart;
    const xEnd = this.data.canvasOffsetX + this.data.canvasDrawWidth * xWidthFactorEnd;

    ctx.setStrokeStyle('rgba(255, 0, 0, 0.8)');
    ctx.setLineWidth(3);
    ctx.beginPath();
    ctx.moveTo(xStart, yPos);
    ctx.lineTo(xEnd, yPos);
    ctx.stroke();
    ctx.draw(true); // `true` indicates additive drawing (draws over the previous image)
  },

  /**
   * Helper function to finalize a measurement:
   * - Constructs the localized result string.
   * - Updates page data (measurementResult, lastMeasurementTypeKey, lastMeasurementRawValue).
   * - Saves the measurement data (typeKey, rawValue, timestamp) to local history.
   * @param {string} typeKey - The locale key for the measurement type.
   * @param {string} rawValue - The raw simulated value of the measurement.
   */
  _finalizeMeasurement(typeKey, rawValue) {
    const measurementType = app.globalData.locales[typeKey] || typeKey.replace('measurement_', ''); // Fallback for key
    const suffix = app.globalData.locales.measure_simulated_value_suffix || '(Simulated)'; // Fallback for suffix
    const resultString = `${measurementType}: ${rawValue}cm ${suffix}`;

    this.setData({
      measurementResult: resultString,
      lastMeasurementTypeKey: typeKey,
      lastMeasurementRawValue: rawValue
    });

    let history = wx.getStorageSync('measurementHistory') || [];
    const measurementData = {
      typeKey: typeKey, value: rawValue, timestamp: new Date().toISOString()
    };
    history.unshift(measurementData);
    wx.setStorageSync('measurementHistory', history);
  },

  measureChest: function() {
    if (!this.data.imageLoaded) return; // Check if image is loaded before drawing
    this._drawMeasurementLine(0.45); // Draw chest indicator line
    this._finalizeMeasurement('measurement_chest', '90'); // Finalize and save
  },

  measureWaist: function() {
    if (!this.data.imageLoaded) return;
    this._drawMeasurementLine(0.60); // Draw waist indicator line
    this._finalizeMeasurement('measurement_waist', '75');
  },

  measureHip: function() {
    if (!this.data.imageLoaded) return;
    this._drawMeasurementLine(0.70); // Draw hip indicator line
    this._finalizeMeasurement('measurement_hip', '95');
  },

  measureNeck: function() {
    if (!this.data.imageLoaded) return;
    this._drawMeasurementLine(0.25, 0.3, 0.7); // Draw neck indicator line (shorter)
    this._finalizeMeasurement('measurement_neck', '38');
  },

  /**
   * Loads localized strings into page data.
   * Also updates the navigation bar title and re-localizes the current measurement result if one exists.
   */
  loadLangData: function() {
    this.setData({ lang: app.globalData.locales });
    const navBarTitle = (app.globalData.locales && app.globalData.locales.measure_nav_title)
                        ? app.globalData.locales.measure_nav_title
                        : 'Simulated Measurement';
    wx.setNavigationBarTitle({ title: navBarTitle });

    // If a measurement result is already displayed, re-localize it
    if (this.data.measurementResult && this.data.lastMeasurementTypeKey && this.data.lastMeasurementRawValue) {
        const measurementType = app.globalData.locales[this.data.lastMeasurementTypeKey] || this.data.lastMeasurementTypeKey.replace('measurement_', '');
        const suffix = app.globalData.locales.measure_simulated_value_suffix || '(Simulated)';
        const resultString = `${measurementType}: ${this.data.lastMeasurementRawValue}cm ${suffix}`;
        this.setData({ measurementResult: resultString });
    }
  },

  onShow: function () {
    this.loadLangData(); // Load language data every time page is shown
  },
  onReady: function () {},
  onHide: function () {},
  onUnload: function () {},
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    const appName = (app.globalData.locales && app.globalData.locales.appName) ? app.globalData.locales.appName : 'BodyMeasurePro';
    const pageTitle = (app.globalData.locales && app.globalData.locales.measure_nav_title) ? app.globalData.locales.measure_nav_title : 'Simulated Measurement';
    return { title: `${pageTitle} - ${appName}`, path: `/pages/measure/measure?imagePath=${this.data.imagePath}` };
  }
})
