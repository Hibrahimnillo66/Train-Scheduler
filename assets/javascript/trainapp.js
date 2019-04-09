$(document).ready(function(){


    //  START CODING BELOW!!

    // Initialize Firebase
    var config = {
      apiKey: "AIzaSyDPKoCZDZQEdV8gFBxpn5rughcawaAQ1ow",
      authDomain: "trainscheduler-4e126.firebaseapp.com",
      databaseURL: "https://trainscheduler-4e126.firebaseio.com",
      projectId: "trainscheduler-4e126",
      storageBucket: "",
      messagingSenderId: "420904043435"
      };
    firebase.initializeApp(config);
  
      // Create a variable to reference the database
      var database = firebase.database();
  
      var nameTrain = "";
      var nameDestination = "";
      var firstTrainTime = "";
      var frequency = 0;
      
      function currentTime() {
        var current = moment().format('LT');
        $("#currentTime").html(current);
        setTimeout(currentTime, 1000);
      };

      //THIS FUNCTION SAVES INFO IN SESSION INSIDE APPLICATION IN DEVELOPER TOOLS
      $(".form-field").on("keyup", function() {
        var traintemp = $("#inputTrain").val().trim();
        var citytemp = $("#inputDestination").val().trim();
        var timetemp = $("#inputTime").val().trim();
        var freqtemp = $("#inputFrequency").val().trim();
      
        sessionStorage.setItem("train", traintemp);
        sessionStorage.setItem("city", citytemp);
        sessionStorage.setItem("time", timetemp);
        sessionStorage.setItem("freq", freqtemp);
      });
      
      $("#inputTrain").val(sessionStorage.getItem("train"));
      $("#inputDestination").val(sessionStorage.getItem("city"));
      $("#inputTime").val(sessionStorage.getItem("time"));
      $("#inputFrequency").val(sessionStorage.getItem("freq"));
  
      // Capture Button Click
      $("#add-train").on("click", function(event) {
        // Don't refresh the page!
        event.preventDefault();
  
        //THIS AVOIDS THAT USER LEAVES A BLANK INOUT FIELD
        if($("#inputTrain").val().trim()=== "" ||
        $("#inputDestination").val().trim()===""||
        $("#inputTime").val().trim()===""||
        $("#inputFrequency").val()===""){

          alert("Please fill in all details to add new train");
        } else{
          nameTrain = $("#inputTrain").val().trim();
          nameDestination = $("#inputDestination").val().trim();
          firstTrainTime = $("#inputTime").val().trim();
          frequency = $("#inputFrequency").val();

          $(".form-field").val("");

          //THIS PUSHES THE VALUE INPUT TO FIREBASE
          database.ref("train-schedule").push({
            nameTrain:nameTrain,
            nameDestination:nameDestination,
            firstTrainTime:firstTrainTime,
            frequency:frequency,
            dateAdded: firebase.database.ServerValue.TIMESTAMP
          });
          sessionStorage.clear();
        }
  
      });
      // Firebase watcher + initial loader HINT: This code behaves similarly to .on("value")
        database.ref("train-schedule").on("child_added", function(childSnapshot) {
  
        // Log everything that's coming out of snapshot
        console.log(childSnapshot.val().nameTrain);
        console.log(childSnapshot.val().nameDestination);
        console.log(childSnapshot.val().firstTrainTime);
        console.log(childSnapshot.val().frequency);

        //Varibales to calculate times from moment.js
  
        var startTimeConverted = moment(childSnapshot.val().firstTrainTime, "hh:mm").subtract(1, "years");
        var timeDiff = moment().diff(moment(startTimeConverted), "minutes");
        var timeRemain = timeDiff % childSnapshot.val().frequency;
        var minToArrival = childSnapshot.val().frequency - timeRemain;
        var nextTrain = moment().add(minToArrival, "minutes");
        var key = childSnapshot.key;

        //appends table row to div
        var newrow = $("<tr>");
        newrow.append($("<td>" + childSnapshot.val().nameTrain + "</td>"));
        newrow.append($("<td>" + childSnapshot.val().nameDestination + "</td>"));
        newrow.append($("<td class='text-center'>" + childSnapshot.val().frequency + "</td>"));
        newrow.append($("<td class='text-center'>" + moment(nextTrain).format("LT") + "</td>"));
        newrow.append($("<td class='text-center'>" + minToArrival + "</td>"));
        newrow.append($("<td class='text-center'><button class='arrival btn btn-danger btn-xs' data-key='" + key + "'>X</button></td>"));

        // IF THE TRAIN TIME TO ARRIVE IS LESS THAN 6 MIN IT ADDS A CLASS THAT LATER CAN BE USED TO CHANGE FORMAT
        if (minToArrival < 6) {
        newrow.addClass("info");
        }

         $("#train-table-rows").append(newrow);
  
        // Handle the errors
        }, function (errorObject) {
        console.log("Errors handled: " + errorObject.code);
        });
        
        //THIS REMOVES THE ROW WITH THE TRAIN INFO FROM HTML AND FIREBASE
        $(document).on("click", ".arrival", function() {
          keyref = $(this).attr("data-key");
          database.ref("train-schedule").child(keyref).remove();
          window.location.reload();
        });
       
        //CALL FUNCTION TO HAVE HOUR IN WEBSITE SHOWING
        currentTime();

        //RELOADS THE WEBPAGE EVERY 60 SECONDS
        setInterval(function() {
          window.location.reload();
        }, 60000);

})