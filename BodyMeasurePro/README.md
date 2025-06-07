# BodyMeasurePro

**A WeChat Mini Program to demonstrate camera-based body measurement (chest, waist, hip, neck).**
This WeChat Mini Program is designed to help users estimate their body circumferences (chest, waist, hip, neck) using their phone's camera. It is intended for human subjects.

**Note: Currently, all measurements are simulated.**

## Features

*   Live camera view for image capture.
*   Switch between front and back cameras.
*   Optimized camera page guides: includes labeled horizontal lines for Neck, Chest, Waist, and Hip, plus vertical torso and centering lines.
*   Visual indicators drawn on the captured image (measure page) to show the approximate area for the selected measurement.
*   Simulated measurement for Chest, Waist, Hip, and Neck.
*   Storage of measurement history (type, value, timestamp).
*   Ability to view and clear measurement history.
*   Multi-language support (English/Chinese) with an on-page switcher on the home page.

## How to Use

1.  (Optional) Select your preferred language using the 'English'/'中文' buttons at the top of the home page.
2.  Tap "Start Measurement" on the home page.
3.  On the camera page, use the "Switch Camera" button if needed. Use the enhanced on-screen guides (labeled lines for Neck, Chest, Waist, Hip, and torso/centering lines) to position yourself. Then tap "Capture".
4.  You will be taken to the "Simulated Measurement" page, where the captured image is displayed on a canvas.
5.  Tap "Measure Chest", "Measure Waist", "Measure Hip", or "Measure Neck". Lines will be drawn on the image indicating the approximate measurement area, alongside the simulated text result.
6.  A simulated measurement value (e.g., "Chest: 90cm (Simulated)") will be displayed and saved to your local history.
7.  Navigate back to the home page (using the top-left back arrow) and tap "View History" to see all saved measurements. You can also clear the history from this page.

## Important Limitations

*   **Simulated Measurements**: The core feature of measuring body dimensions from an image is NOT yet implemented. All displayed measurements are placeholders and not based on image analysis. This is a proof-of-concept for the UI flow and data handling.
*   **Accuracy**: No real-world accuracy can be expected from the current version. The values are entirely simulated.

## Future Development

*   Integration of actual computer vision models for body segmentation and measurement.
*   User guidance for optimal photo capture (e.g., ensuring correct pose, distance, and lighting).
*   Calibration tools for improved accuracy.
*   More detailed measurement history and trends.

## Tips for Best Results (Future Accuracy)

While the current version uses simulated measurements, adhering to these guidelines would be important if actual image processing were implemented for accurate results:

*   **Pose**: Stand upright and straight, facing the camera directly. Look forward. Relax your shoulders and keep your arms slightly away from your sides (e.g., a 15-20 degree angle).
*   **Distance & Framing**: Position yourself so that your entire body, at least from the top of your head to your mid-thighs, is clearly visible within the frame. Avoid being too close or too far.
*   **Clothing**: Wear form-fitting clothing. Bulky or loose clothes can significantly skew measurements.
*   **Lighting**: Ensure you are in a well-lit area with even lighting. Avoid strong shadows or backlighting.
*   **Background**: A plain, contrasting background is preferable.

## Project Structure

*   `/images`: Icon files (currently placeholders) and other static image assets.
*   `/pages`: Contains all pages of the mini-program:
    *   `index`: The home page with navigation to camera and history, and language switcher.
    *   `camera`: Page for capturing photos using the device camera, with optimized visual guides.
    *   `measure`: Page to display the captured photo on a canvas, trigger simulated measurements with visual indicators.
    *   `history`: Page to display the list of saved measurements.
*   `/utils`: Utility scripts (currently minimal).
*   `app.js`: Global application logic. Internationalization strings for English and Chinese are managed within `app.js` (for this version, typically these might be in separate `/locales` JSON files).
*   `app.json`: Global application configuration, including page registration and window styling.
*   `app.wxss`: Global styles (currently empty).
*   `project.config.json`: WeChat DevTools project configuration, including AppID and settings.

---
This README provides an overview of the BodyMeasurePro application, its current capabilities, limitations, and future direction.
