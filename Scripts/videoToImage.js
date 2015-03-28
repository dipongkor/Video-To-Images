var windowWidth;
var windowHeight;
var canvasArray = [];
var imageIndex = 0;
var videoSelected = false;
var isStartConvertion = false;
var notificationIcon = window.location.origin+"/images/32.png";
var spin =
    function (what) {
        if (what == "show") {
            $.mobile.loading("show", {
                text: "Converting...",
                textVisible: true,
                theme: "b"
            });
        } else {
            $.mobile.loading("hide");
        }
    };

var spinSaveImage =
    function (what) {
        if (what == "show") {
            $.mobile.loading("show", {
                text: "Saving...",
                textVisible: true,
                theme: "b"
            });
        } else {
            $.mobile.loading("hide");
        }
    };
var spinShareImage =
    function (what) {
        if (what == "show") {
            $.mobile.loading("show", {
                text: "Creating Image...",
                textVisible: true,
                theme: "b"
            });
        } else {
            $.mobile.loading("hide");
        }
    };

var imageSettings = {height:2048,width:1536,aspectRatio:true};

$(document).ready(function () {
    window.addEventListener('visibilitychange',function(){
        window.close();
    });
    if ("imageSettings" in localStorage) {
        imageSettings =  JSON.parse(localStorage["imageSettings"]);
    }else{
        localStorage["imageSettings"] = JSON.stringify(imageSettings);
    }

        $('body').on('click', '.share-image', function () {
            var imageId = $(this).data("id");
             shareImage(imageId);
        });

         $('body').on('click', '.save-image', function () {
           var imageId = $(this).data("id");
           saveImage(imageId);
        });

    $(document).on("pageshow", "#settingsPage", function (event) {
      $('#imageWidth').val(imageSettings.width);
        $('#imageHeight').val(imageSettings.height);
        if(imageSettings.aspectRatio){
            $('#aspectRatio').attr('checked', true).checkboxradio("refresh");
        }else{
            $('#aspectRatio').attr('checked', false).checkboxradio("refresh");
        }
    });

    $('#saveSettings').on('click',function(){
        imageSettings.height =  $('#imageHeight').val();
        imageSettings.width =  $('#imageWidth').val();
        if(document.getElementById('aspectRatio').checked){
            imageSettings.aspectRatio = true;
        }else{
            imageSettings.aspectRatio = false;
        }
        localStorage["imageSettings"] = JSON.stringify(imageSettings);
        alert("Saved Successfully");
    });

    $('#settingsButtonId').on('click',function(){

        $.mobile.changePage("#settingsPage", {transition:"slide"});
    });

    windowWidth = window.innerWidth;
    windowHeight = window.innerHeight;

    $('#changeVideo').on('click', function () {
         var changeVideoText = $('#changeVideo').html();

         if(changeVideoText=="Browse"){
         $('#changeVideo').html("Reset");
         $("#homePage").trigger("create");
         videoSelected = true;
          takeVideo();
         }else{
         location.reload();
         }
       
    });

    $('#startConverting').on('click', function () {
       if(videoSelected){
        var video = document.getElementById('videoMain');
        var startConvertingText =  $('#startConverting').html();

           if(startConvertingText == "Start"){
               isStartConvertion = true;
               video.play();
               $('#startConverting').html("Stop");
               $('#convertLoader').css({display:"block"});
               $("#homePage").trigger("create");

           }else{
               video.pause();
               $('#startConverting').html("Start");
               isStartConvertion = false;
               $('#convertLoader').css({display:"none"});
               $("#homePage").trigger("create");
           }
       }else{
       alert("No Video Selected. Please Select");
       }
       
    });

    navigator.mozSetMessageHandler('activity', function(activityRequest) {
        if(activityRequest.source.data.blobs[0] == null){
            alert("No Video Selected");
        }
        $('#videoContainer').empty();
        var videoSource = window.URL.createObjectURL(activityRequest.source.data.blobs[0]);
        var videoElement = $('<video id="videoMain" controls="controls" src="' + videoSource + '"></video>');
        $('#videoContainer').append(videoElement);
        $('#videoContainer').css('display','block');
        $('#changeVideo').html("Reset");
        $("#homePage").trigger("create");
        videoSelected = true;
        var video = document.getElementById('videoMain');
        video.addEventListener("timeupdate", function () {
            getImageOfTheFrame(video);
        }, false);


        video.addEventListener("ended", function () {
            $('#startConverting').html("Start");
            isStartConvertion = false;
            $('#convertLoader').css({display:"none"});
            $("#homePage").trigger("create");

        }, false);
    });
});

function takeVideo() {
    var pickVideo = new window.MozActivity({
        name: "pick",
        data: {
            type: ["video/*"]
        }
    });

    pickVideo.onsuccess = function () {
        var videoSource = window.URL.createObjectURL(this.result.blob);
        var videoElement = $('<video id="videoMain" controls="controls" src="' + videoSource + '"></video>');
        $('#videoContainer').append(videoElement);
        $('#videoContainer').css('display','block');
        var video = document.getElementById('videoMain');

        video.addEventListener("timeupdate", function () {
            getImageOfTheFrame(video);
        }, false);


        video.addEventListener("ended", function () {
            $('#startConverting').html("Start");
            isStartConvertion = false;
            $('#convertLoader').css({display:"none"});
            $("#homePage").trigger("create");
           
        }, false);
    };

    pickVideo.onerror = function(){
        $('#changeVideo').html("Browse");
        $("#homePage").trigger("create");
        videoSelected = false;
    };
}

function getImageOfTheFrame(video) {
    if(!isStartConvertion){
        return;
    }
    var thecanvas = document.getElementById('thecanvas');
    thecanvas.height = $('#videoMain').height();
    thecanvas.width = document.getElementById('videoMain').offsetWidth;
    var context = thecanvas.getContext('2d');
    context.drawImage(video, 0, 0, thecanvas.width, thecanvas.height);
    var dataUrl = thecanvas.toDataURL();
    var imageId = "img" + imageIndex;
    var image = $('<img src="' + dataUrl + '" id="' + imageId + '"/>');
   
    var photoDiv = $('<div class="photoDiv"></div>');
    photoDiv.append(image);
    photoDiv.append(getShareUiDiv(imageIndex));
    $('#imageContainer').append(photoDiv);
    imageIndex++;
    $("#homePage").trigger("create");
}

function getShareUiDiv(index) {
    var shareDiv = $('<div class="ui-grid-a"><div class="ui-block-a"><a data-role="button" data-icon="check" data-id="'+index+'" class="save-image">Save</a></div><div class="ui-block-b"><a data-icon="action" data-role="button" data-id="'+index+'" class="share-image">Share</a></div></div>');

    return shareDiv;
}

function saveImage(index) {
    spinSaveImage("show");
    var imageId = "#img" + index;
    var image = $(imageId);
    var img = new Image();
    img.src = image.attr('src');

    imageSettings =  JSON.parse(localStorage["imageSettings"]);
    var thecanvas = document.getElementById('thecanvas');
    //aspect ratio

    if(imageSettings.aspectRatio){
        var imgRatio = document.getElementById('img'+index);
        var width = imgRatio.clientWidth;
        var height = imgRatio.clientHeight;
        var ratioResult = calculateAspectRatioFit(width,height,imageSettings.width,imageSettings.height);
        thecanvas.height = ratioResult.height;
        thecanvas.width = ratioResult.width;
    }else{
        thecanvas.height = imageSettings.height;
        thecanvas.width = imageSettings.width;
    }

    var context = thecanvas.getContext('2d');
    context.drawImage(img, 0, 0, thecanvas.width, thecanvas.height);

    thecanvas.toBlob(function (blob) { 

        var randomFileName = "Video2Image" + Math.random().toString(36).substr(2, 15) + ".png";
        
        var sdcard = navigator.getDeviceStorage("sdcard");
        var request = sdcard.delete(randomFileName);
     
        request.onsuccess = function () {
                            savePhotoToSdCard(blob,randomFileName);
                            console.log("success and savePhotoToSdCard called");
                            };

        request.onerror = function () {
                            savePhotoToSdCard(blob,randomFileName);
                            alert("File writting error");
                            };
        });
}

function calculateAspectRatioFit(srcWidth, srcHeight, maxWidth, maxHeight) {

    var ratio = Math.min(maxWidth / srcWidth, maxHeight / srcHeight);

    return { width: srcWidth*ratio, height: srcHeight*ratio };
}

function shareImage(index) {
    spinShareImage("show");
   var imageId = "#img" + index;
    var image = $(imageId);
    var img = new Image();
    img.src = image.attr('src');

    imageSettings =  JSON.parse(localStorage["imageSettings"]);
    var thecanvas = document.getElementById('thecanvas');
    if(imageSettings.aspectRatio){
        var imgRatio = document.getElementById('img'+index);
        var width = imgRatio.clientWidth;
        var height = imgRatio.clientHeight;
        var ratioResult = calculateAspectRatioFit(width,height,imageSettings.width,imageSettings.height);
        thecanvas.height = ratioResult.height;
        thecanvas.width = ratioResult.width;
    }else{
        thecanvas.height = imageSettings.height;
        thecanvas.width = imageSettings.width;
    }

    var context = thecanvas.getContext('2d');
    context.drawImage(img, 0, 0, thecanvas.width, thecanvas.height);

     thecanvas.toBlob(function(blob){
            var a = new MozActivity({
                name: 'share',
                data: {
                    type: 'image/*',
                    number: 1,
                    blobs: [blob],
                    filenames: ['Video2Image.png']
                }
            });
            a.onsuccess = function() {
                spinShareImage("hide");
               // alert("Photo Shared Succesfully");
                addNotification("Photo Shared");
            };
            a.onerror = function() {
                spinShareImage("hide");
                console.log("Unable to Share Photo.")
            };
        });
}

function savePhotoToSdCard(blob, randomFileName) {

    var sdcard = navigator.getDeviceStorage("sdcard");
    var request = sdcard.addNamed(blob, "Video2Images/"+randomFileName);

    request.onsuccess = function () {
        var name = this.result;
        spinSaveImage("hide");
       // alert("Photo Save Successfully.");
        addNotification("Photo Saved");
    };

    request.onerror = function (e) {
        alert("Unable to Save Photo");
    };
}

function addNotification(notifyText){
    if ("Notification" in window) {
        // Firefox OS 1.1 and higher
        if (Notification.permission !== "denied") {
            Notification.requestPermission(function (permission) {
                if(!("permission" in Notification)) {
                    Notification.permission = permission;
                }
            });
        }

        if (Notification.permission === "granted") {
            new Notification("Video To Images", {
                body : notifyText,
                icon:notificationIcon
            });
        }
    }
    else {
        // Firefox OS 1.0
        var notify = navigator.mozNotification.createNotification(
            "Video To Images",
            notifyText
        );
        notify.show();
    }
}