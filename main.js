
function bindStream(callback) {
  navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
  window.URL = window.URL || window.webkitURL;
 
  var sources = MediaStreamTrack.getSources(function(data) {
    var videoId;
    for(var i = 0; i < data.length; i++) {
      if (data[i].kind === "video") {
        if (data[i].facing === "environment" || !videoId) {
          videoId = data[i].id;
        }
      }
    }
    if (videoId) {
      navigator.getUserMedia({video: { optional: [{sourceId: videoId}]}, audio: true}, 
        function(stream) {
          // onSuccess
          console.log(stream);
          callback(stream);
        },
        function(err) {
          // onError
          console.log(err);
      });
    } else {
      alert("Video device not found...");
    }
  });
}

function setHisStream(hisStream) {
  var hisViewVideo = document.getElementById('hisViewVideo');
  hisViewVideo.src = window.URL.createObjectURL(hisStream);

  hisViewVideo.onclick = function() {
  /* Fullscreen if possible */
  if (hisViewVideo.webkitRequestFullscreen) {
    //Chrome15+, Safari5.1+, Opera15+
    hisViewVideo.webkitRequestFullscreen();
  } else if (hisViewVideo.mozRequestFullScreen) {
    //Firefox10+
    hisViewVideo.mozRequestFullScreen();
  } else if (hisViewVideo.msRequestFullscreen) {
    //IE11+
    hisViewVideo.msRequestFullscreen();
  } else if (hisViewVideo.requestFullscreen) {
    //HTML5
    hisViewVideo.requestFullscreen();
  }
  }
}

function callee(peer) {
  peer.on('open', function(peerId) {
    var qr = new JSQR();
    var code = new qr.Code();
    code.encodeMode = code.ENCODE_MODE.BYTE;
    code.version = code.DEFAULT;
    code.errorCorrection = code.ERROR_CORRECTION.H;
    var input = new qr.Input();
    input.dataType = input.DATA_TYPE.TEXT;
    input.data = 'https://monami-ya.github.io/IDCM-inspired/#' + peerId; // Should be fixed.
    var matrix = new qr.Matrix(input, code);
    matrix.scale = 4;
    matrix.margin = 2;
    var canvas = document.getElementById('qr-image');
    canvas.setAttribute('width', matrix.pixelWidth);
    canvas.setAttribute('height', matrix.pixelWidth);
    canvas.getContext('2d').fillStyle = 'rgb(0,0,0)';
    matrix.draw(canvas, 0, 0);
  });
  peer.on('call', function(call) {
    bindStream(function(stream) {
      var canvas = document.getElementById('qr-image');
      canvas.style.visibility = 'hidden';
      call.answer(stream);
      call.on('stream', setHisStream);
    });
  });
}

function caller(peer, peerId) {
  bindStream(function(stream) {
    var call = peer.call(peerId, stream);
    call.on('stream', setHisStream);
  });
}

window.onload = function() {
  var peer = new Peer({key: 'bj7fmtn8tmeoecdi'});
  if (location.hash) {
    var peerId = location.hash.replace(/^#/, "");
    caller(peer, peerId);
  } else {
    callee(peer);
  }
};
