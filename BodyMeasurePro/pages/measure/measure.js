// pages/measure/measure.js
/**
 * Measure Page: Displays the captured image on a canvas, initializes VisionKit for body detection,
 * triggers detection, processes results, and allows users to trigger simulated body measurements
 * with visual indicators. Results are displayed and saved.
 */
const app = getApp(); // Get the app instance

// Mock TF is kept for potential fallback but VisionKit is primary for detection
const mockTf = {
  loadGraphModel: async (modelPath) => {
    console.log(`Simulating loading model from: ${modelPath}`);
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        console.log("Model loaded successfully (simulated).");
        resolve({
          estimatePoses: async (canvasElementIgnored, flipHorizontalIgnored) => {
            console.log("Simulating TF estimatePoses...");
            return new Promise(res => setTimeout(() => {
               console.log("TF estimatePoses completed (simulated).");
               res([{
                   score: 0.8,
                   keypoints: [
                       { name: 'left_shoulder', score: 0.85, x: 100, y: 150 },
                       { name: 'right_shoulder', score: 0.82, x: 200, y: 150 },
                       { name: 'left_hip', score: 0.75, x: 110, y: 250 },
                       { name: 'right_hip', score: 0.72, x: 190, y: 250 },
                       { name: 'nose', score: 0.9, x: 150, y: 100 },
                       { name: 'left_ear', score: 0.7, x: 80, y: 105 },
                       { name: 'right_ear', score: 0.68, x: 220, y: 105 },
                       { name: 'left_elbow', score: 0.7, x: 70, y: 190 },
                       { name: 'right_elbow', score: 0.68, x: 230, y: 190 },
                       { name: 'left_wrist', score: 0.65, x: 60, y: 230 },
                       { name: 'right_wrist', score: 0.62, x: 240, y: 230 },
                       { name: 'left_knee', score: 0.78, x: 120, y: 350 },
                       { name: 'right_knee', score: 0.76, x: 180, y: 350 },
                       { name: 'left_ankle', score: 0.7, x: 125, y: 450 },
                       { name: 'right_ankle', score: 0.69, x: 175, y: 450 }
                   ]
               }]);
            }, 1500));
          }
        });
      }, 2000);
    });
  }
};

Page({
  data: {
    imagePath: '', // Path to the captured image
    measurementResult: '', // String to display the latest measurement result
    lang: {}, // For storing localized strings
    imageLoaded: false, // Flag: true when the image is drawn on canvas
    originalImageWidth: 0,  // Original width of the loaded image
    originalImageHeight: 0, // Original height of the loaded image
    canvasDrawWidth: 300,   // Calculated width for drawing image on canvas (maintaining aspect ratio)
    canvasDrawHeight: 400,  // Calculated height for drawing image on canvas (maintaining aspect ratio)
    canvasOffsetX: 0,       // X-offset for centering image on canvas
    canvasOffsetY: 0,       // Y-offset for centering image on canvas
    lastMeasurementTypeKey: null, // Stores the typeKey of the last measurement for re-localization
    lastMeasurementRawValue: null, // Stores the raw value of the last measurement for re-localization

    // VisionKit specific states
    visionKitSession: null, // Stores the VKSession object
    visionKitReady: false,  // Flag: true when VisionKit session has started successfully
    visionKitError: false,  // Flag: true if any VisionKit related error occurs
    visionKitRawKeypoints: null, // Raw keypoints from VK (relative to the image data passed to detectBody)
    visionKitKeypoints: null,    // Scaled keypoints (relative to the canvas element itself, after offsets)
    visionKitDetectionInProgress: false, // Flag: true when VK detectBody is active
    visionKitUserMessage: '' // User-facing status/error messages related to VisionKit
  },
  canvasCtx: null, // Stores the canvas rendering context
  // model: null, // TF Model instance (if TF were active)

  onLoad: function (options) {
    this.setData({
      imagePath: options.imagePath || null,
      measurementResult: '', imageLoaded: false,
      visionKitSession: null, visionKitReady: false, visionKitError: false,
      visionKitRawKeypoints: null, visionKitKeypoints: null,
      visionKitDetectionInProgress: false, visionKitUserMessage: ''
    });
    this.canvasCtx = wx.createCanvasContext('measureCanvas');
    this.loadLangData();
    if (this.data.imagePath) { this.loadImageOntoCanvas(this.data.imagePath); }
    else {
      console.error("No imagePath provided to measure page");
      const errTitle = (this.data.lang && this.data.lang.measure_error_no_image_toast)
                       ? this.data.lang.measure_error_no_image_toast : 'Error: No image';
      this.setData({ visionKitUserMessage: errTitle, visionKitError: true });
    }
    this.initVisionKit();
  },

  /**
   * Initializes the VisionKit session for body detection.
   */
  initVisionKit() {
    // Check if the VisionKit API is available in the current WeChat version
    if (!wx.createVKSession) {
      console.error("wx.createVKSession is not available.");
      this.setData({
        visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_not_supported) || 'VisionKit not supported. Please update WeChat.',
        visionKitReady: false, visionKitError: true
      });
      return;
    }
    try {
      // Create a VisionKit session
      // track: { body: { mode: 2 } } specifies body tracking for static images.
      // version: 'v1' (or newer, check WeChat documentation for latest stable version).
      const session = wx.createVKSession({ track: { body: { mode: 2 } }, version: 'v1' });
      this.setData({ visionKitSession: session });

      // Listener for runtime errors from the VisionKit session
      session.on('error', error => {
        console.error('VisionKit Session Error:', error);
        this.setData({
          visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_error_toast) || 'VisionKit error.',
          visionKitReady: false, visionKitError: true, visionKitDetectionInProgress: false
        });
        wx.hideLoading(); // Ensure loading indicator is hidden on error
      });

      // Listener for when body anchors (including keypoints) are updated/detected
      session.on('updateAnchors', anchors => {
        console.log('VisionKit updateAnchors:', anchors);
        wx.hideLoading();
        let userMsg = '', rawKps = null, scaledKps = null, vkError = false;

        if (anchors && anchors.length > 0) {
          const bodyAnchor = anchors[0]; // Assume one primary body
          // bodyAnchor.points is a flat array [x0, y0, x1, y1, ...] relative to the image data passed to detectBody
          if (bodyAnchor.points && bodyAnchor.points.length > 0) {
            rawKps = [];
            for (let i = 0; i < bodyAnchor.points.length; i += 2) {
               rawKps.push({ x: bodyAnchor.points[i], y: bodyAnchor.points[i+1] });
            }
            this.setData({ visionKitRawKeypoints: rawKps }); // Store raw keypoints
            scaledKps = this._scaleKeypoints(rawKps);     // Scale them for canvas drawing
            if (scaledKps && scaledKps.length > 0) {
                userMsg = (this.data.lang && this.data.lang.visionkit_detection_success) || 'Body features detected!';
            } else {
                userMsg = (this.data.lang && this.data.lang.visionkit_detection_failed) || 'No body features detected. Using default lines.';
                vkError = true;
            }
          } else {
            userMsg = (this.data.lang && this.data.lang.visionkit_detection_failed) || 'No body features detected. Using default lines.';
            vkError = true;
          }
        } else {
          userMsg = (this.data.lang && this.data.lang.visionkit_detection_failed) || 'No body features detected. Using default lines.';
          vkError = true;
        }

        this.setData({
            visionKitKeypoints: scaledKps, // Store scaled keypoints for drawing
            visionKitUserMessage: userMsg,
            visionKitError: vkError,
            visionKitDetectionInProgress: false
        });
        console.log("Processed (scaled) VisionKit Keypoints:", scaledKps);
      });

      // Start the VisionKit session
      session.start(error => {
        if (error) {
          console.error('VisionKit Session Start Failed:', error);
          this.setData({
            visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_start_failed_toast) || 'VisionKit failed to start.',
            visionKitReady: false, visionKitError: true
          });
          return;
        }
        console.log('VisionKit Session Started Successfully.');
        this.setData({ visionKitReady: true, visionKitError: false, visionKitUserMessage: '' });
        if (this.data.imageLoaded) { this.detectBodyFeaturesFromCanvas(); }
      });
    } catch (err) {
      console.error("Error creating VKSession:", err);
      this.setData({
          visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_creation_failed) || 'Failed to create VisionKit session.',
          visionKitReady: false, visionKitError: true
      });
    }
  },

  /**
   * Scales raw keypoints from VisionKit to absolute canvas coordinates.
   * VisionKit returns points relative to the image data it processed.
   * This image data was extracted from a specific region (this.data.canvasDrawWidth/Height)
   * at a specific offset (this.data.canvasOffsetX/Y) on the main canvas.
   * So, we add these offsets to the raw points.
   * @param {Array} rawKeypoints - Array of {x, y} points from VisionKit.
   */
  _scaleKeypoints(rawKeypoints) {
    if (!rawKeypoints || rawKeypoints.length === 0 || !this.data.imageLoaded) {
      return null;
    }
    return rawKeypoints.map((kp) => ({
      x: kp.x + this.data.canvasOffsetX,
      y: kp.y + this.data.canvasOffsetY,
    }));
  },

  /**
   * Loads the captured image onto the canvas, maintaining aspect ratio.
   * Triggers body feature detection if VisionKit is ready.
   * @param {string} path - File path of the image.
   */
  loadImageOntoCanvas(path) {
    const ctx = this.canvasCtx;
    wx.createSelectorQuery().select('#measureCanvas').boundingClientRect(rect => {
      if (!rect) { console.error("Canvas element not found for sizing."); wx.showToast({ title: 'Canvas Error', icon: 'none'}); return; }
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
            imagePath: path
          });
          ctx.drawImage(path, offsetX, offsetY, drawWidth, drawHeight);
          ctx.draw();
          this.setData({ imageLoaded: true });
          if (this.data.visionKitReady) { this.detectBodyFeaturesFromCanvas(); }
          else { console.log("Image loaded, but VisionKit not ready yet."); }
        },
        fail: (err) => { console.error("Failed to get image info:", err); wx.showToast({ title: 'Failed to load image', icon: 'none' }); }
      });
    }).exec();
  },

  /**
   * Extracts image data from the canvas and passes it to VisionKit for body detection.
   */
  detectBodyFeaturesFromCanvas() {
    if (!this.data.visionKitReady || !this.data.imageLoaded) { return; }
    if (this.data.visionKitDetectionInProgress) { return; }
    this.setData({
        visionKitDetectionInProgress: true,
        visionKitRawKeypoints: null, visionKitKeypoints: null,
        visionKitUserMessage: ''
    });
    const loadingTitle = (this.data.lang && this.data.lang.visionkit_detecting) ? this.data.lang.visionkit_detecting : 'Analyzing features...';
    wx.showLoading({ title: loadingTitle });

    // Get pixel data from the specific region of the canvas where the image was drawn
    wx.canvasGetImageData({
      canvasId: 'measureCanvas',
      x: this.data.canvasOffsetX,
      y: this.data.canvasOffsetY,
      width: this.data.canvasDrawWidth,   // Use the actual drawn width of the image
      height: this.data.canvasDrawHeight, // Use the actual drawn height of the image
      success: (res) => {
        if (this.data.visionKitSession) {
          // Pass the image data (frameBuffer) and its dimensions to detectBody
          this.data.visionKitSession.detectBody({
            frameBuffer: res.data.buffer,
            width: res.width,  // Width of the imageData buffer
            height: res.height, // Height of the imageData buffer
            scoreThreshold: 0.3, // Confidence threshold for detection
            sourceType: 1        // 1 for static image
          });
          // Results are handled by the 'updateAnchors' listener
        } else {
            this.setData({ visionKitDetectionInProgress: false, visionKitUserMessage: 'VK Session lost.', visionKitError: true });
            wx.hideLoading();
        }
      },
      fail: (err) => {
        console.error("wx.canvasGetImageData failed:", err);
        this.setData({
            visionKitUserMessage: (this.data.lang && this.data.lang.visionkit_getimagedata_failed) || 'Failed to get image data.',
            visionKitDetectionInProgress: false, visionKitError: true
        });
        wx.hideLoading();
      }
    });
  },

  /**
   * Draws a measurement line on the canvas.
   * Attempts to use VisionKit keypoints; falls back to static lines if unavailable.
   * @param {string} measurementType - Key for the type of measurement (e.g., 'measurement_chest').
   */
  _drawMeasurementLine(measurementType) {
    if (!this.data.imageLoaded || !this.canvasCtx) return;
    const ctx = this.canvasCtx;
    // 1. Redraw the base image to clear previous lines
    ctx.drawImage(this.data.imagePath, this.data.canvasOffsetX, this.data.canvasOffsetY, this.data.canvasDrawWidth, this.data.canvasDrawHeight);

    const keypoints = this.data.visionKitKeypoints; // These are already scaled to canvas coordinates
    let lineDrawn = false;

    // Keypoint mapping based on hypothetical VisionKit 23-point model:
    // (Indices represent common body models like COCO/BlazePose, but VisionKit's actual indices must be verified from its documentation)
    // 0: Nose, 1: L_Eye, 2: R_Eye, 3: L_Ear, 4: R_Ear,
    // 5: L_Shoulder, 6: R_Shoulder, 7: L_Elbow, 8: R_Elbow,
    // 9: L_Wrist, 10: R_Wrist, 11: L_Hip, 12: R_Hip,
    // 13: L_Knee, 14: R_Knee, 15: L_Ankle, 16: R_Ankle
    // IMPORTANT: These indices are placeholders for this simulation.
    const VK_NOSE = 0;
    const VK_L_SHOULDER = 5;
    const VK_R_SHOULDER = 6;
    const VK_L_HIP = 11;
    const VK_R_HIP = 12;

    if (keypoints && keypoints.length > Math.max(VK_L_SHOULDER, VK_R_SHOULDER, VK_L_HIP, VK_R_HIP, VK_NOSE)) {
      // Helper to safely get a keypoint by its assumed index
      const getKp = (index) => (keypoints[index] && typeof keypoints[index].x === 'number' && typeof keypoints[index].y === 'number') ? keypoints[index] : null;

      try {
        let p1, p2, yPos, xStart, xEnd, centerX;
        ctx.setStrokeStyle('rgba(255, 0, 0, 0.8)'); ctx.setLineWidth(3); ctx.beginPath();

        // Logic for deriving lines from keypoints
        switch (measurementType) {
            case 'measurement_chest': // Line between shoulders
              p1 = getKp(VK_L_SHOULDER); p2 = getKp(VK_R_SHOULDER);
              if (p1 && p2) { yPos = (p1.y + p2.y) / 2; ctx.moveTo(p1.x, yPos); ctx.lineTo(p2.x, yPos); lineDrawn = true; }
              break;
            case 'measurement_waist': // Estimated: 40% down from hips to shoulders, width of hips
              const lHipW = getKp(VK_L_HIP); const rHipW = getKp(VK_R_HIP);
              const lShoulderW = getKp(VK_L_SHOULDER); const rShoulderW = getKp(VK_R_SHOULDER);
              if (lHipW && rHipW && lShoulderW && rShoulderW) {
                const shoulderY = (lShoulderW.y + rShoulderW.y) / 2; const hipY = (lHipW.y + rHipW.y) / 2;
                yPos = hipY + (shoulderY - hipY) * 0.4; // Estimate waistline Y position
                xStart = Math.min(lHipW.x, rHipW.x); xEnd = Math.max(lHipW.x, rHipW.x); // Use hip width as proxy
                ctx.moveTo(xStart, yPos); ctx.lineTo(xEnd, yPos); lineDrawn = true;
              }
              break;
            case 'measurement_hip': // Line between hips
              p1 = getKp(VK_L_HIP); p2 = getKp(VK_R_HIP);
              if (p1 && p2) { yPos = (p1.y + p2.y) / 2; ctx.moveTo(p1.x, yPos); ctx.lineTo(p2.x, yPos); lineDrawn = true; }
              break;
            case 'measurement_neck': // Estimated: Below nose, width relative to shoulders
              const noseN = getKp(VK_NOSE); const lsN = getKp(VK_L_SHOULDER); const rsN = getKp(VK_R_SHOULDER);
              if (noseN && lsN && rsN) {
                 yPos = noseN.y + (((lsN.y + rsN.y)/2) - noseN.y) * 0.35; // Closer to nose than shoulders
                 const shoulderWidth = Math.abs(rsN.x - lsN.x); const neckWidthEstimate = shoulderWidth * 0.35;
                 centerX = (lsN.x + rsN.x) / 2;
                 ctx.moveTo(centerX - neckWidthEstimate / 2, yPos); ctx.lineTo(centerX + neckWidthEstimate / 2, yPos); lineDrawn = true;
              }
              break;
        }
        if (lineDrawn) ctx.stroke();
      } catch (e) { console.error("Error drawing pose-informed line:", e); lineDrawn = false; }
    }

    // Fallback to static lines if dynamic drawing failed
    if (!lineDrawn) {
        console.log("Using static fallback lines for:", measurementType);
        let yFactor, xSF = 0.1, xEF = 0.9; // Default x-factors
        if (measurementType === 'measurement_chest') yFactor = 0.45;
        else if (measurementType === 'measurement_waist') yFactor = 0.60;
        else if (measurementType === 'measurement_hip') yFactor = 0.70;
        else if (measurementType === 'measurement_neck') { yFactor = 0.25; xSF = 0.3; xEF = 0.7; } // Shorter line for neck
        else return;

        const sY = this.data.canvasOffsetY + this.data.canvasDrawHeight * yFactor;
        const sXS = this.data.canvasOffsetX + this.data.canvasDrawWidth * xSF;
        const sXE = this.data.canvasOffsetX + this.data.canvasDrawWidth * xEF;

        ctx.setStrokeStyle('rgba(0, 0, 255, 0.7)'); ctx.setLineWidth(2); ctx.beginPath();
        ctx.moveTo(sXS, sY); ctx.lineTo(sXE, sY); ctx.stroke();
        ctx.setFontSize(10); ctx.setFillStyle('blue');
        // Ensure lang is loaded before accessing fallback line text
        const fallbackText = (this.data.lang && this.data.lang.visionkit_fallback_line) || '(Default Line)';
        ctx.fillText(fallbackText, this.data.canvasOffsetX + 5, this.data.canvasOffsetY + 15);
    }
    ctx.draw(true); // Apply all drawing operations (base image + line)
  },

  _finalizeMeasurement(typeKey, rawValue) {
    const measurementType = app.globalData.locales[typeKey] || typeKey.replace('measurement_', '');
    const suffix = app.globalData.locales.measure_simulated_value_suffix || '(Simulated)';
    const resultString = `${measurementType}: ${rawValue}cm ${suffix}`;
    this.setData({
      measurementResult: resultString,
      lastMeasurementTypeKey: typeKey,
      lastMeasurementRawValue: rawValue
    });
    let history = wx.getStorageSync('measurementHistory') || [];
    const measurementData = { typeKey: typeKey, value: rawValue, timestamp: new Date().toISOString() };
    history.unshift(measurementData);
    wx.setStorageSync('measurementHistory', history);
  },

  measureChest: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_chest'); this._finalizeMeasurement('measurement_chest', "90"); },
  measureWaist: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_waist'); this._finalizeMeasurement('measurement_waist', "75"); },
  measureHip: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_hip'); this._finalizeMeasurement('measurement_hip', "95"); },
  measureNeck: function() { if (!this.data.imageLoaded || !this.data.visionKitReady || this.data.visionKitError || this.data.visionKitDetectionInProgress) return; this._drawMeasurementLine('measurement_neck'); this._finalizeMeasurement('measurement_neck', "38"); },

  loadLangData: function() {
    this.setData({ lang: app.globalData.locales });
    const navBarTitle = (app.globalData.locales && app.globalData.locales.measure_nav_title)
                        ? app.globalData.locales.measure_nav_title : 'Simulated Measurement';
    wx.setNavigationBarTitle({ title: navBarTitle });
    if (this.data.measurementResult && this.data.lastMeasurementTypeKey && this.data.lastMeasurementRawValue) {
        const measurementType = app.globalData.locales[this.data.lastMeasurementTypeKey] || this.data.lastMeasurementTypeKey.replace('measurement_', '');
        const suffix = app.globalData.locales.measure_simulated_value_suffix || '(Simulated)';
        const resultString = `${measurementType}: ${this.data.lastMeasurementRawValue}cm ${suffix}`;
        this.setData({ measurementResult: resultString });
    }
  },

  // Optional: Kept for debugging VisionKit keypoints directly if needed
  drawDetectedKeypoints() {
      if (!this.data.visionKitKeypoints || !this.canvasCtx || !this.data.imageLoaded) return;
      const ctx = this.canvasCtx;
      // Redraw base image before drawing keypoints on top
      ctx.drawImage(this.data.imagePath, this.data.canvasOffsetX, this.data.canvasOffsetY, this.data.canvasDrawWidth, this.data.canvasDrawHeight);
      this.data.visionKitKeypoints.forEach(kp => {
          ctx.beginPath();
          ctx.arc(kp.x, kp.y, 3, 0, 2 * Math.PI);
          ctx.setFillStyle('yellow'); // VK points are unnamed, use a generic color
          ctx.fill();
      });
      ctx.draw(true);
  },

  onShow: function () { this.loadLangData(); },
  onReady: function () {},
  onHide: function () {},
  onUnload: function () {
    if (this.data.visionKitSession) {
      console.log("Stopping VisionKit session on page unload.");
      this.data.visionKitSession.stop();
      this.setData({ visionKitSession: null, visionKitReady: false });
    }
  },
  onPullDownRefresh: function () {},
  onReachBottom: function () {},
  onShareAppMessage: function () {
    const appName = (app.globalData.locales && app.globalData.locales.appName) ? app.globalData.locales.appName : 'BodyMeasurePro';
    const pageTitle = (app.globalData.locales && app.globalData.locales.measure_nav_title) ? app.globalData.locales.measure_nav_title : 'Simulated Measurement';
    return { title: `${pageTitle} - ${appName}`, path: `/pages/measure/measure?imagePath=${this.data.imagePath}` };
  }
});
