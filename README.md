# Exposures Recorder

This is the exposures.me browser-based recording interface for taking time lapse snapshots of your activities.

This is only a working prototype and cannot be guaranteed to work very well outdoors yet.

Although, if you put this on your car's dashboard, that might work.

## Requires a browser that supports the following

* WebRTC
* Geolocation
* Appcache
* IndexedDB

This means the latest Firefox or Chrome.

## Quirks for video dimensions

Firefox does not currently support arbitrary width/height for the video stream and will default to 4:3. If you want to change this, go to `about:config`, search for 'media' and look for the width and height values to adjust it to 16:9 - no guarantees on it looking pretty (it'll look very stretched out and weird). On the other hand, Firefox does support both the option to select either a front-facing or back-facing camera.

Chrome supports arbitrary width/height for the video stream but on Android it does not currently support the back-facing camera - only the front-facing one.
