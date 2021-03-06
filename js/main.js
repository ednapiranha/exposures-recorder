define(['jquery', 'asyncStorage', 'recorder', 'streamer', 'local'],
  function ($, asyncStorage, Recorder, Streamer, local) {
  'use strict';

  // This is where we change the time lapse count
  var interval = 0.2; // In seconds
  var canvas = document.createElement('canvas');
  var streamer = new Streamer();
  var recorder = new Recorder();

  var preview = $('#video-preview');
  var previewEl = $('.previews');
  var debug = $('.debugger');

  var media = [];

  streamer.startVideo(function (err, data) {
    if (err) {
      console.log(err);
    } else {
      streamer.video = data.videoElement;
      streamer.video.width = data.videoElement.width;
      streamer.video.height = data.videoElement.height;
      preview.append(streamer.video);
      streamer.video.play();
    }
  });

  var saveFrame = function (img, callback) {
    media.push({
      frame: img.src,
      geo: recorder.lat + ',' + recorder.lon,
      description: '',
      created: Math.round(new Date().getTime() / 1000)
    });

    callback();
  };

  var captureFrame = function (pendingFrames, callback) {
    pendingFrames --;
    var currFrame = (pendingFrames - 1) + pendingFrames;
    var img = document.createElement('img');

    canvas.getContext('2d').drawImage(streamer.video, 0, 0, canvas.width, canvas.height);
    img.src = canvas.toDataURL('image/jpeg', 0.4);

    if (pendingFrames > 0) {
      setTimeout(function () {
        saveFrame(img, function () {
          captureFrame(pendingFrames, callback);
        });
      }, interval * 1000); // timeouts are in milliseconds
    } else {
      var created = Date.now();
      asyncStorage.getItem('frameList', function (frames) {
        if (frames) {
          frames.unshift(created);
          asyncStorage.setItem('frameList', frames);
        } else {
          asyncStorage.setItem('frameList', [created]);
        }
      });

      recorder.videoFrames.id = created;
      asyncStorage.setItem('frames[' + recorder.videoFrames.id + ']', recorder.videoFrames);
      callback(true);
    }
  };

  var getScreenshot = function (callback) {
    var pendingFrames = 49;

    if (streamer.video) {
      canvas.width = streamer.video.width;
      canvas.height = streamer.video.height;

      captureFrame(pendingFrames, callback);
    }
  };

  $('#record').click(function (ev) {
    ev.preventDefault();
    var self = $(this);

    previewEl.empty();
    self.addClass('on');
    debug.append('<p>start recording</p>');
    recorder.video = streamer.video;
    recorder.getScreenshot(function () {
      self.removeClass('on');
    }, 100, recorder.interval);
  });

  $('.uploader').click(function (ev) {
    ev.preventDefault();

    var isDeleted = false;

    asyncStorage.getItem('frameList', function (frames) {
      console.log(frames)
      frames.forEach(function (f) {
        asyncStorage.getItem('frames[' + f + ']', function (data) {
          $.ajax({
            url: local.url + '/api/add/post',
            crossDomain: true,
            data: { api: local.apiKey, frames: data },
            dataType: 'json',
            success: function (d) {
              console.log('uploaded: ', d);
              asyncStorage.removeItem('frames[' + f + ']');
              isDeleted = true;
            },
            error: function (xhr, status, error) {
              console.log(status);
            }
          });
        });
      });

      if (isDeleted) {
        asyncStorage.removeItem('frameList');
      }
    });
  });
});

