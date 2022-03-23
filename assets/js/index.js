var checkout = {};

$(document).ready(function() {
  var $messages = $('.messages-content'),
    d, h, m,
    i = 0;

  $(window).load(function() {
    $messages.mCustomScrollbar();
    insertResponseMessage('Hi there, I\'m your personal Concierge. How can I help?');
  });

  function updateScrollbar() {
    $messages.mCustomScrollbar("update").mCustomScrollbar('scrollTo', 'bottom', {
      scrollInertia: 10,
      timeout: 0
    });
  }

  function setDate() {
    d = new Date()
    if (m != d.getMinutes()) {
      m = d.getMinutes();
      $('<div class="timestamp">' + d.getHours() + ':' + m + '</div>').appendTo($('.message:last'));
    }
  }

  function callChatbotApi(message) {
    // params, body, additionalParams
    return sdk.chatbotPost({}, {
      messages: [{
        type: 'unstructured',
        unstructured: {
          text: message
        }
      }]
    }, {});
  }

  function insertMessage() {
    msg = $('.message-input').val();
    if ($.trim(msg) == '') {
      return false;
    }
    $('<div class="message message-personal">' + msg + '</div>').appendTo($('.mCSB_container')).addClass('new');
    setDate();
    $('.message-input').val(null);
    updateScrollbar();

    callChatbotApi(msg)
      .then((response) => {
        console.log(response);
        var data = response.data;

        if (data.messages && data.messages.length > 0) {
          console.log('received ' + data.messages.length + ' messages');

          var messages = data.messages;

          for (var message of messages) {
            if (message.type === 'unstructured') {
              insertResponseMessage(message.unstructured.text);
            } else if (message.type === 'structured' && message.structured.type === 'product') {
              var html = '';

              insertResponseMessage(message.structured.text);

              setTimeout(function() {
                html = '<img src="' + message.structured.payload.imageUrl + '" witdth="200" height="240" class="thumbnail" /><b>' +
                  message.structured.payload.name + '<br>$' +
                  message.structured.payload.price +
                  '</b><br><a href="#" onclick="' + message.structured.payload.clickAction + '()">' +
                  message.structured.payload.buttonLabel + '</a>';
                insertResponseMessage(html);
              }, 1100);
            } else {
              console.log('not implemented');
            }
          }
        } else {
          insertResponseMessage('Oops, something went wrong. Please try again.');
        }
      })
      .catch((error) => {
        console.log('an error occurred', error);
        insertResponseMessage('Oops, something went wrong. Please try again.');
      });
  }

  $('.message-submit').click(function() {
    insertMessage();
  });

  $(window).on('keydown', function(e) {
    if (e.which == 13) {
      insertMessage();
      return false;
    }
  })

  function insertResponseMessage(content) {
    $('<div class="message loading new"><figure class="avatar"><img src="https://media.tenor.com/images/4c347ea7198af12fd0a66790515f958f/tenor.gif" /></figure><span></span></div>').appendTo($('.mCSB_container'));
    updateScrollbar();

    setTimeout(function() {
      $('.message.loading').remove();
      $('<div class="message new"><figure class="avatar"><img src="https://media.tenor.com/images/4c347ea7198af12fd0a66790515f958f/tenor.gif" /></figure>' + content + '</div>').appendTo($('.mCSB_container')).addClass('new');
      setDate();
      updateScrollbar();
      i++;
    }, 500);
  }

});

function showPreview(event){
  if(event.target.files.length > 0){
    var src = URL.createObjectURL(event.target.files[0]);
    var preview = document.getElementById("file-ip-1-preview");
    preview.src = src;
    preview.style.display = "block";
  }

}

function uploadPhoto() {
  let file = document.getElementById("inputFile").files[0];
  let file_name = file.name;
  let file_type = file.type;
  let reader = new FileReader();

  reader.onload = function () {
    let arrayBuffer = this.result;
    let blob = new Blob([new Int8Array(arrayBuffer)], {
      type: file_type,
    });
    let blobUrl = URL.createObjectURL(blob);

    // $("#addPic").attr("src", blobUrl);
    $("#addContain").removeClass("hide");
    document.getElementById("addName").innerText =
      "File '" + file_name + "' successfully uploaded!";
    console.log(blob);

    let imageTags = document.getElementById("labels").value;
    console.log("ImageTags ", imageTags);

    let data = document.getElementById("inputFile").files[0];
    let xhr = new XMLHttpRequest();
    xhr.withCredentials = true;
    xhr.addEventListener("readystatechange", function () {
      if (this.readyState === 4) {
        console.log(this.responseText);
      }
    });
    xhr.withCredentials = false;
    xhr.open(
      "PUT",
      "https://3q1r08q2zf.execute-api.us-east-1.amazonaws.com/dev" +
        "/upload/photo-album-storage/" +
        data.name,
      true
    );
    console.log(data.name);
    xhr.setRequestHeader("Content-Type", data.type);
    xhr.setRequestHeader("x-api-key", "iWWl6Y9PtI9VSkCfE18FTaWZqbBPdgWf25uQ7grB");
    if(imageTags && imageTags !== "") {
      xhr.setRequestHeader("x-amz-meta-customlabels", imageTags);
    }
    // xhr.setRequestHeader("Access-Control-Allow-Origin", "*");
    // xhr.setRequestHeader("Access-Control-Allow-Methods", "PUT");
    // xhr.setRequestHeader("Access-Control-Allow-Headers", "*");
    // console.log(data.name);
    xhr.send(data);

    // xhr.open("PUT", "https://nyu-cc-photo-album-photo.s3.amazonaws.com/"+data.name);
    // console.log(data.name)
    // xhr.setRequestHeader("Content-Type", data.type);
    // xhr.send(data);
  };
  reader.readAsArrayBuffer(file);
}

function search(ele) {
  if(event.key === 'Enter') {
    displayImages();     
  }
}

function displayImages() {
  let queryText = document.getElementById("search-box").value;
  document.getElementById("imageDisplaySection").style.visibility = 'visible';
  var params = {
    headers: {
      param0: 'Accept:application/json',
    },
    'q' : queryText
  };
  var body = []
  var apigClient = apigClientFactory.newClient({apiKey:'iWWl6Y9PtI9VSkCfE18FTaWZqbBPdgWf25uQ7grB'});
    apigClient.searchGet(params,body)
    .then(function(result){
      var data =  result['data'];
      console.log(data.s3_base_url + "/"+ data.images[0]);
      // base = JSON.parse(result['data']['s3_base_url'])
      images = data.images;
      var num_images = images.length;
      if (num_images > 0){
        img_area = document.getElementById('imageDisplay');
        img_area.innerHTML = "";
        
        let html = "";
        images.forEach(matchedImage => {
          console.log("matchedImage ", matchedImage);
            html += `
            <div class="gallery">
              <img src="${data.s3_base_url + '/' + matchedImage}" alt="${matchedImage}" width="250" height="250">
              <div class="desc">${data.search_string + ': ' + matchedImage}</div>
            </div>`;
        });
        img_area.innerHTML = html;
      }
      else{
          img_area = document.getElementById('imageDisplay')
          img_area.innerHTML = "";
          img_area.innerHTML += 'No Photos'
          alert("Oops, the requested photo(s) could not be found!");
        }
      });
}

function runSpeechRecognition() {
  // get output div reference
  var output = document.getElementById("output");
  // get action element reference
  var action = document.getElementById("action");
      // new speech recognition object
      var SpeechRecognition = SpeechRecognition || webkitSpeechRecognition;
      var recognition = new SpeechRecognition();
  
      // This runs when the speech recognition service starts
      recognition.onstart = function() {
          action.innerHTML = "<small>listening, please speak...</small>";
      };
      
      recognition.onspeechend = function() {
          action.innerHTML = "<small>stopped listening, hope you are done...</small>";
          recognition.stop();
      }
    
      // This runs when the speech recognition service returns result
      recognition.onresult = function(event) {
          var transcript = event.results[0][0].transcript;
          var confidence = event.results[0][0].confidence;
          var text = document.getElementById('search-box');
          text.value += transcript;
          // output.innerHTML = "<b>Text:</b> " + transcript + "<br/> <b>Confidence:</b> " + confidence*100+"%";
          // output.classList.remove("hide");
      };
    
       // start recognition
       recognition.start();
}