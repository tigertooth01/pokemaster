// Note: encounteredPokeIndex is just the index in json. It is NOT the pokemon number.
// 
// 

//These are id's of legendaries.
var legendaries = [144,145,146,150,151,243,244,245,249,250,251,377,378,379,380,381,382,383,384,385,386,480,481,482,483,484,485,486,487,488,489,490,491,492,493,494,638,639,640,641,642,643,644,645,646,647,648,649];

//These are indices of legendaries in the json. This is the one that is used for encounter/capture.
var legendaryIndices = [143, 144, 145, 149, 150, 242, 243, 244, 248, 249, 250, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664];


//MAPS////////////////////////////////////////////////////////////////////////////
var map;
var mapInitFlag=false;
var currentLocAddress;
var scanButtonFlag=false;  
var scanCount=0; 
var themeIndex=1;       //current theme (need to save locally)
var maxThemes=10;       //total number of theme images
 var pokemonJsonObj;     
var encounteredPokeIndex;
var encounteredRarity;//0,1,2,3,4,5 - very common, common, uncommon, rare, very rare, legend
 var marker;           
var jsonEntries;
var partyObj;
 var alias;
var currentPage;
var userLevel=1;
var levelDispFlag=false;
var lastRefresh;
var selectedBall=0;//0-PB, 1-GB, 2-UB, 3-MB
var awaitingCaptureResultFlag=false;
var pb=0;
    var gb=0;
    var ub=0;
    var mb=0;
var energy=100;
var my_media = null;
//var link="http://localhost/";
//var link="http://192.168.2.3/";
var link="http://logicgiant.com/client/";
//var link="http://poke.hol.es/";




document.addEventListener("deviceready", onDeviceReady, false);


function onDeviceReady()
{
   //google.maps.event.addDomListener(window, 'load', initialize);
    
   //alert('device ready');
    document.addEventListener("offline", onOffline, false);
    cordova.dialogGPS("The app requires GPS to scan for nearby Pokemon",//message
                    "Use GPS, with wifi or mobile data.",//description
                    function(buttonIndex){//callback
                      switch(buttonIndex) {
                        case 0: navigator.app.exitApp(); break;//cancel
                        case 2: break;//user go to configuration
                      }},
                      "Please Turn on GPS!",//title
                      ["Cancel","Go"]);//buttons
    document.addEventListener("resume", onAppResumed, false);
    
    function onAppResumed(){
        if(!mapInitFlag){
            location.reload(); 
        }
    }
    //for json file download init
    downloadInit();
    
    document.addEventListener("backbutton", function (e) {
       
        e.preventDefault();
            if($.mobile.activePage.is('#mapPage')||$.mobile.activePage.is('#register'))
            {
                
                nativeConfirm('Do you wanna exit?',onExitConfirm,'Exit','Yes,No');
            }
        else
        {
            navigator.app.backHistory();
        }
            
        }, false );

}

function onOffline() {
    // Handle the offline event
    plert('Please check internet connectivity. The app will now quit!',exitAlertDismissed,'Can\'t Connect','OK');
    
}

function exitAlertDismissed() {
    // do something
    navigator.app.exitApp();
}

// process the confirmation dialog result
function onExitConfirm(buttonIndex) {
    if(buttonIndex==1)
    {
     
        navigator.app.exitApp();
    }
}

function alertDismissed()
{
 
    //called for simple alerts.
}
function plert(msg,callback,title,btn)
{
    
    navigator.notification.alert(
        msg,  // message
        callback,         // callback
        title,            // title
        btn                  // buttonName
    );
}


// Show a custom confirmation dialog
//
function nativeConfirm(msg,callback,title,buttonLabels) {
    //alert('here');
    navigator.notification.confirm(
        msg, // message
        callback,            // callback to invoke with index of button pressed
        title,           // title
        buttonLabels         // buttonLabels
    );
}







function initialize() {
     geocoder = new google.maps.Geocoder();
  var mapOptions = {
    zoom: 17
  };
  map = new google.maps.Map(document.getElementById('map-canvas'),
      mapOptions);

  // Try HTML5 geolocation
  if(navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(function(position) 
            {
                if(marker)
                marker.setMap(null);
              var pos = new google.maps.LatLng(position.coords.latitude,
                                               position.coords.longitude);
                
                
         var latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                
                
               geocoder.geocode({'latLng': latlng}, function(results, status) {
            if (status == google.maps.GeocoderStatus.OK) {
              if (results[1]) {
                currentLocAddress=results[1].formatted_address;
               mapInitFlag = true;
               // alert(currentLocAddress);
              } else {
                  mapInitFlag = false;
                alert('No results found');
              }
            } else {
                mapInitFlag = false;
              alert('Geocoder failed due to: ' + status);
            }
          });
                
              
               marker = new google.maps.Marker({
              position: pos,
              map: map,
              icon:'img/pokepin.png'
          });
              
                
              map.setCenter(pos);
                
                
              /*var element = document.getElementById('geolocation');
                element.innerHTML = 'Latitude: '  + position.coords.latitude      + '<br />' +
                                    'Longitude: ' + position.coords.longitude     + '<br />' +
                                    '<hr />'      + element.innerHTML;*/
                
        
    }, function() {
      handleNoGeolocation(true);
    });
  } else {
    // Browser doesn't support Geolocation
    handleNoGeolocation(false);
  }
    google.maps.event.addListenerOnce(map, 'idle', function(){//when maps loaded completely, call link disable function
        //nav('register'); 
        checkCookie();
        disableMapLink();
        
    // do something only the first time the map is loaded
});
}

         
            
            
            
function handleNoGeolocation(errorFlag) {
  if (errorFlag) {
    var content = 'Error: The Geolocation service failed.';
  } else {
    var content = 'Error: Your browser doesn\'t support geolocation.';
  }

  var options = {
    map: map,
    position: new google.maps.LatLng(60, 105),
    content: content
  };

  var infowindow = new google.maps.InfoWindow(options);
  map.setCenter(options.position);
}




////////////////////////////////////////////////////////////////////////////
            
            
//choose which pokemon to show////////////////////////////////////////////////////////////////////////////
            function calculate()            
    {
     
//        alert('calculate');
        var selectedString;//the selected string from 4 categories after going through randomization
        var sum=0;
        var locationSplits=new Array();
        locationSplits=currentLocAddress.split(",");
        
        /*var commonString=locationSplits[locationSplits.length-3]+locationSplits[locationSplits.length-1];
        var ruralString=locationSplits[locationSplits.length-3]+locationSplits[locationSplits.length-2];
        var rareString=locationSplits[locationSplits.length-3]+locationSplits[locationSplits.length-2]+locationSplits[locationSplits.length-1];
        var superRareString=locationSplits[locationSplits.length-3];*/
        var veryCommonString=locationSplits[0]+locationSplits[locationSplits.length-2];
        var commonString=locationSplits[0];
        var unCommonString=locationSplits[0]+locationSplits[locationSplits.length-1];
        var rareString=locationSplits[0]+locationSplits[1];
        var veryRareString=locationSplits[0]+locationSplits[1]+locationSplits[2];
        var ultraRareString='';
        
        
       /*  var random=Math.floor((Math.random()*100)+1);   //randomization for choosing category of pokemon
               
                if((random<=30)||(random>=70))       //common
                {
                     
                   selectedString=commonString;
                document.getElementById('pokemonName').style.textShadow = '';
                    document.getElementById('pokemonName').style.color="#000";
                    
                }
                   else if((random>30)&&(random<=55))   //rural
                {
                   
                    selectedString=ruralString;
                    document.getElementById('pokemonName').style.textShadow = '0px 0px 5px #00f';
                    document.getElementById('pokemonName').style.color="#005";
                }
        else if((random>55)&&(random<=65))   //rural
                {
                    selectedString=rareString;
                    document.getElementById('pokemonName').style.textShadow = '0px 0px 5px #0f0';
                    document.getElementById('pokemonName').style.color="#050";
                }
        else 
        {
            selectedString=superRareString;
            document.getElementById('pokemonName').style.textShadow = '0px 0px 5px #f00';
            document.getElementById('pokemonName').style.color="#500";
        }*/
        
        var random=Math.random()*100.0;//var random=75;//
        
        
        if(random<=25||random>75)
        {
            encounteredRarity = 0;
         selectedString=veryCommonString;
                document.getElementById('pokemonName').style.textShadow = '';
                    document.getElementById('pokemonName').style.color="#000";
            
        }
        
        else if(random>37.5&&random<=62.5)
        {
            encounteredRarity = 1;
          selectedString=commonString;
                document.getElementById('pokemonName').style.textShadow = '0px 0px 5px #00f';
                    document.getElementById('pokemonName').style.color="#005";
            
        }
        
        else if(random>25&&random<=37.5)//else if(random==75)//
        {
            encounteredRarity = 2;
          selectedString=unCommonString;
                document.getElementById('pokemonName').style.textShadow = '0px 0px 5px #0f0';
                    document.getElementById('pokemonName').style.color="#050";
            
        }
        
        else if(random>62.5&&random<=70)
        {
            encounteredRarity = 3;
          selectedString=rareString;
                document.getElementById('pokemonName').style.textShadow = '0px 0px 5px #f0f';
                    document.getElementById('pokemonName').style.color="#505";
            
        }
        
        else if(random>70&&random<=74)
        {
            encounteredRarity = 4;
          selectedString=veryRareString;
                document.getElementById('pokemonName').style.textShadow = '0px 0px 5px #f00';
                    document.getElementById('pokemonName').style.color="#500";
            
        }
        
        else{
            encounteredRarity = 5;
         
            //alert('legendary ecounter logic!');
            document.getElementById('pokemonName').style.textShadow = '0px 0px 10px #FFD700';
            document.getElementById('pokemonName').style.color="#c90";
            encounteredPokeIndex = legendaryIndices[Math.floor(Math.random()*legendaryIndices.length)];
        //alert(encounteredPokeIndex);
            document.getElementById("pokemonPic").src=pokemonJsonObj[encounteredPokeIndex].img; 
            document.getElementById('pokemonName').innerHTML=pokemonJsonObj[encounteredPokeIndex].name;
            playAudio(link+'pokemaster/data/cries/'+pokemonJsonObj[encounteredPokeIndex].id+'.wav');
            if(isInParty(encounteredPokeIndex))
        {
         
            //$('#pokemonName').append("<img class='ownsMark' >");
            $(".ownsMark").show(); 
            $(".ownsMark").attr("src",store+"ball.png");
        }
            else
            {
                $(".ownsMark").hide(); 
            }
        return;
            
        }
        
        
        jsonEntries=pokemonJsonObj.length;
        //alert(jsonEntries);
        for(var i=0;i<selectedString.length;i++)
        {
          
         sum+=parseInt(selectedString.charAt(i).charCodeAt(0)-65);
           if(sum>jsonEntries)
               sum=sum-jsonEntries;
        }
        
        
    if(pokemonJsonObj[0].id)
    {
        encounteredPokeIndex=sum-1;
        encounteredPokeIndex = unlegendify(encounteredPokeIndex);
     document.getElementById("pokemonPic").src=pokemonJsonObj[encounteredPokeIndex].img; 
        document.getElementById('pokemonName').innerHTML=pokemonJsonObj[encounteredPokeIndex].name;
        
        playAudio(link+'pokemaster/data/cries/'+pokemonJsonObj[encounteredPokeIndex].id+'.wav');
        if(isInParty(encounteredPokeIndex))
        {
         
            //$('#pokemonName').append("<img class='ownsMark'>");
            $(".ownsMark").show(); 
            $(".ownsMark").attr("src",store+"ball.png");
        }
        else
        {
         $(".ownsMark").hide();   
        }
        //alert(obj[sum-1].img);
    }
        
        
    }
            
////////////////////////////////////////////////////////////////////////////

//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//Test Zone (temporary functions not to be used in app)//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~//

////////////////Get legendaries' index number //////////////////

function getIndice()
{

for(var i=0;i<pokemonJsonObj.length;i++)
{
 
    for(var j=0;j<legendaries.length;j++)
    {
    if(parseInt(pokemonJsonObj[i].id)==legendaries[j])
    {
//       alert(i); 
        break;
    }
    }
}
}
//143, 144, 145, 149, 150, 242, 243, 244, 248, 249, 250, 376, 377, 378, 379, 380, 381, 382, 383, 384, 385, 386, 387, 388, 489, 490, 491, 492, 493, 494, 495, 496, 497, 498, 499, 500, 501, 502, 503, 504, 505, 650, 651, 652, 653, 654, 655, 656, 657, 658, 659, 660, 661, 662, 663, 664
//////////////////////////////////////////////////////////////////////////////

////////////////////////////////Get max MasterPower points///////////////////////
function getMaxPoints()
{
//    alert('calcing..'+pokemonJsonObj.length);
    var sum=0;
    for(var i=0;i<pokemonJsonObj.length;i++)
    {
        
        sum+=255-parseInt(pokemonJsonObj[i].misc.capturerate);
        $('#debugMsg').html(sum+":"+i);
        
    }
    
    
    //approx 103733.
}

/////////////////////////////////////////////////////////////////////////

////////////////////////////////Check If Legendary////////////////////////


function checkLegendary(num)
{
 
    if($.inArray(num,legendaries)!=-1)
        {
         
            return true;
        }
    else
    {
     
        return false;
    }
}
//////////////////////////////////////////////////////////////////////////


////////////////////////////////Cancel Legendary Encounter////////////////////////
function unlegendify(num)
{
    
 //alert('unlegendify '+num);
    if(checkLegendary(parseInt(pokemonJsonObj[num].id)))
    {
     
        //alert('legendary is '+num);
        num+=5;
        if(num>jsonEntries)
               num=1;
        return unlegendify(num);
    }
    else
    {
     //alert('returning '+num);
        return num;
    }
}

            
/////////////SCAN AREA///////////////////////////////////////////////////////
     function scanArea()
            {
                //alert('scanarea')
                
                    
             var random=Math.random()*10.0;   //random nummber for checking encounter
              // alert(random);
                if(random>5)
                {
                    $('#map-canvas').hide();
                    $('#pokemonDiv').show();
                    calculate();
//                 alert("You've encountered a pokemon");     //do the showing pokemon here...
                    showToast("warning","You've encountered a pokemon","2000");
                    
    /*$('.inner').slideDown( 2000, function() {
    $('.inner').show( 100 );
  });*/
                    
                    
                }   
                else
                    
                {
                     
                    if(scanButtonFlag)
                    {
                    //alert("Found nothing!");
                        showToast('info','Found nothing!','2000');
                    }
                 closePokemonDiv();
                }
                
                    
                scanCount++;
            }
            
////////////////////////////////////////////////////////////////////////////
            
            
            
function closePokemonDiv()
{
 
    document.getElementById("pokemonPic").src=""; 
    $(".ownsMark").hide(); 
        document.getElementById('pokemonName').innerHTML="";    
                    scanButtonFlag=false;
                    $('.inner').hide();
    $('#map-canvas').show();
}
         
          
            
////////////////////////////////////////////////////////////////////////////
            
            
            
//////////////////disable google map view full map link///////////////////////////
           
function disableMapLink()
            {
               // alert('disableLink()');
var anchors = document.getElementsByTagName('a'),
    l = anchors.length,
    i,
    a;
//alert('number of a '+l);
for (i = 0; i < l; i++) {
    a = anchors[i];
   // alert(a.href);
    if (a.href.indexOf('http://maps.google.com/maps?') !== -1) {
      //  alert('found..');
         a.title = ''; 
         a.onclick = function() {
        return false;
      };
    }
}          
            }
////////////////////////////////////////////

function register()
{
 //alert('register');
    $.ajax({
                  method: 'post',
                  url: link+"pokemaster/register.php",
                  data: {
                    'uname': document.getElementById('uname').value,
                      'email':document.getElementById('email').value,
                      'pass':document.getElementById('pass').value
                  },
                  success: function(data) {
                    //alert(data);
                       var obj = eval ("(" + data + ")");
                      if(obj.success==1)
                      {
                     //nav('mapPage');
                          username= document.getElementById('uname').value;
                            password= document.getElementById('pass').value;
                          login();
                      }
                      else
                      {
                        alert(obj.message);  
                      }
                  },
                error: function(xhr,status,error) {
                 
                    //alert(error);
                }
        
                });
}

function scanButton()
{
    if(energy>0)
    {
        energy--;
        window.localStorage.setItem("energy", energy);
        displayInventory();
    scanButtonFlag=true;
    scanArea();
    }
    else
    {
     plert('Please wait till you get the hourly recharge.',alertDismissed,'Out of energy!','OK');  
        closePokemonDiv();
        
    }
}


///////////CHANGE THEME///////////

/*function changeTheme()
{
    if(themeIndex==maxThemes)
        themeIndex=1;
    else
    themeIndex++;
    
    $("#themeDiv").css("background", "url('img/theme/bg"+themeIndex+".jpg') top left no-repeat");
    $("#themeDiv").css("background-size", "100% 100%");
}*/
////////////////////////////////////////////

function nav(id)
{
    currentPage=id;
    $.mobile.changePage("#"+id,{transition:'none'});
}
////////////////////////////////////////////////////
function checkCookie()
{
 
    if(window.localStorage.getItem("loginid"))
    {
         alias=window.localStorage.getItem("alias");
        //plert("Welcome "+alias+"! To the road to become a Pokemon Master!",alertDismissed,"Welcome","OK");
    
        
        nav('mapPage');
        $(".trainerName").html(alias);
        $(".id").html(window.localStorage.getItem("loginid"));
        checkRefresh();
        
    }
    else
    {
        nav('register');
    }
}
/////////////////////////Login//////////////////////////////
var username;
var password;
function loginDirect()
{
    username= document.getElementById('unameL').value;
    password= document.getElementById('passL').value;
    login();
}


function login()
{
  //alert('login');
    $.ajax({
                  method: 'post',
                  url: link+"pokemaster/login.php",
                  data: {
                    'uname': username,
                      'pass':password
                  },
                  success: function(data) {
                    //alert(data);
                      var obj = eval ("(" + data + ")");
                      if(obj.success==1)
                      {
                      window.localStorage.setItem("loginid", obj.cookie);
                    window.localStorage.setItem("alias", obj.alias);
                          alias=obj.alias;
                          //alert("Welcome "+alias+"! To the Pokemon world virtual reality!");
                          
                    nav('mapPage');
                          initialize();
                          getParty();
                          $(".trainerName").html(alias);
                          $(".id").html(obj.cookie);
                      }
                      else
                      {
                        alert(obj.message);  
                      }
                  },
                error: function(xhr,status,error) {
                 
                    alert(error);
                }
        
                });
    
}
////////////////////////////Capture PKMN///////////////////////////////
function capture()
{
    var d = new Date();
     $.ajax({
                  method: 'post',
                  url: link+"pokemaster/capture.php",
                  data: {
                    'trainer_id': window.localStorage.getItem("loginid"),
                      'pkmn_index':encounteredPokeIndex,
                      'location':currentLocAddress,
                      'date':d.toDateString()+", "+d.toLocaleTimeString().toString(),
                      'point':255-pokemonJsonObj[encounteredPokeIndex].misc.capturerate
                  },
                  success: function(data) {
                    //alert(data);
                       var obj = eval ("(" + data + ")");
                      if(obj.success==1)
                      {
                          awaitingCaptureResultFlag=false;
                          $('#pokemonPic').removeClass('animated wobble infinite');
                          $('#pokemonPic').addClass('animated bounce infinite');
                          getParty();//initializing user's party.
                           navigator.notification.vibrate(500);
                          //showToast("success",pokemonJsonObj[encounteredPokeIndex].name+obj.message,"3000");
                          //alert(pokemonJsonObj[encounteredPokeIndex].name+obj.message);
                          my_media.stop();
                    playAudio(store+'effects/pokemonCaught.mp3');
                          plert(pokemonJsonObj[encounteredPokeIndex].name+obj.message,alertDismissed,'Congrats!','OK');
                           $('.inner').hide();
                          $('#map-canvas').show();
                  
                 //document.getElementById("pokemonPic").src="img/ball.png"; 
        document.getElementById('pokemonName').innerHTML="";    
                   
                      }
                      else
                      {
                          awaitingCaptureResultFlag=false;
                        alert(obj.message);  
                          //document.getElementById("pokemonPic").src=pokemonJsonObj[encounteredPokeIndex].img; 
                          $("#pokemonPic").attr("src",pokemonJsonObj[encounteredPokeIndex].img);
        closePokemonDiv();
                      }
                  },
                error: function(xhr,status,error) {
                 
                    //alert(error);
                }
        
                });
}

//////////////////////throw pokeball//////////////////
function throwBall()
{
    if(!awaitingCaptureResultFlag)
    {
    if(!isInParty(encounteredPokeIndex))
    {
        awaitingCaptureResultFlag=true;
        
        playAudio(store+'effects/pokeballThrow.mp3');
        if(selectedBall==0)
        {
            if(pb>0)
            {
                pb--;
                //alert('Throwing Pokeball!');
                showToast('info','Throwing Pokeball!','2000');
                $("#pokemonPic").attr("src",store+"pb_lit.png");
                $('#pokemonPic').addClass('animated wobble infinite');
                window.localStorage.setItem("pb", pb);
                callCapture();
                if(pb==0)
                    chooseNextBall();
            }
        }
        else if(selectedBall==1)
        {
            if(gb>0)
            {
                gb--;
                //alert('Throwing Greatball!');
                showToast('info','Throwing Greatball!','2000');
                $("#pokemonPic").attr("src",store+"gb_lit.png");
                $('#pokemonPic').addClass('animated wobble infinite');
                window.localStorage.setItem("gb", gb);
                callCapture();
                if(gb==0)
                    chooseNextBall();
            }
        }
        else if(selectedBall==2)
        {
            if(ub>0)
            {
                ub--;
                //alert('Throwing Ultraball!');
                showToast('info','Throwing Ultraball!','2000');
                $("#pokemonPic").attr("src",store+"ub_lit.png");
                $('#pokemonPic').addClass('animated wobble infinite');
                window.localStorage.setItem("ub", ub);
                callCapture();
                if(ub==0)
                    chooseNextBall();
            }
        }
        else if(selectedBall==3)
        {
            if(mb>0)
            {
                mb--;
                //alert('Throwing Masterball!');
                showToast('info','Throwing Masterball!','2000');
                $("#pokemonPic").attr("src",store+"mb_lit.png");
                $('#pokemonPic').addClass('animated wobble infinite');
                window.localStorage.setItem("mb", mb);
                callCapture();
                if(mb==0)
                    chooseNextBall();
            }
        }
        else
        {
         //no ball left scenario
            plert('You have no balls to capture a Pokemon! Wait for the re-supply!',alertDismissed,'Seriously!','OK');
        }
        
        
        displayInventory();
    
    }
    
    else
    {
        
        //alert("This pokemon was already captured!");
        showToast('warning','This pokemon was already captured!','2000');
    }
    }

}

////////////////////////////////callCapture///////////////////////////
function callCapture()
{
 
    
    setTimeout(function (){
                if(captureSuccess())
            {
             //
                setTimeout(function (){
                capture();
                },3000);
            }
            else
            {
                
                setTimeout(function (){
                    $('#pokemonPic').removeClass('animated wobble infinite');
                    $('#pokemonPic').addClass('animated bounce infinite');
                    //alert('The pokemon escaped!');
                    my_media.stop();
                    playAudio(store+'effects/pokemonEscape.mp3');
                    showToast('error','The pokemon escaped!','2000');
                    awaitingCaptureResultFlag=false;
                    $("#pokemonPic").attr("src",pokemonJsonObj[encounteredPokeIndex].img);
                    //closePokemonDiv();
                    $('.inner').hide();
                    $('#map-canvas').show();
                    
                
                },4000);
              //$("#pokemonPic").attr("src",pokemonJsonObj[encounteredPokeIndex].img);
               
                //setTimeout(function (){closePokemonDiv();},200);
                
            }
    }, 200);
}


/////////////////////choose next ball if one runs out////////////////////////
function chooseNextBall()
{
 
    if(pb>0)
    {
        selectBall('pb');
        
    }
    else if(gb>0)
    {
     
        selectBall('gb');
    }
    else if(ub>0)
    {
     
        selectBall('ub');
    }
    else if(mb>0)
    {
     
        selectBall('mb');
    }
    else
    {
     
        selectedBall=-1;//no ball left scenario
    }
}
////////////////////////////Determines catch success///////////////////////////////
function captureSuccess()
{
    
    playAudio(store+'effects/pokeballWobble.mp3');
var random=Math.random()*10.0;
   //alert(random); 
    var x=1;//multiplier for ball
    switch(selectedBall)
    {
     
            case 0:x=1;
            break;
            
            case 1:x=1.5;
            break;
            
            case 2:x=2;
            break;
            
            case 3:x=100;return true;
            break;
    }
    switch(encounteredRarity)
    {
    
            case 0: if(random<(6*x)) return true; else return false;
                    break;
            
            case 1: if(random<(5*x)) return true; else return false;
                    break;
            
            case 2: if(random<(4*x)) return true; else return false;
                    break;
            
            case 3: if(random<(3*x)) return true; else return false;
                    break;
            
            case 4: if(random<(2*x)) return true; else return false;
                    break;
            
            case 5: if(random<(1*x)) return true; else return false;
                    break;
            
            default:alert('Error:encounteredRarity has undesirable value');
                    return false;
                    break;
    }
    
}


///////////////////////////////////inventory refresh logic/////////////////////////////

/*
First, we check if there is a lastRefresh time in cache. If not, we set one.

Set energy=100, 20 pokeballs to distribute. 80% PB, 10% GB, 7% UB, 3% MB.

If there is a lastRefresh, get currentTime - lastRefresh. If greater than 1hr, refresh and set lastRefresh=currentTime.

Check refresh every time.
*/

function checkRefresh()
{
 
    if(window.localStorage.getItem("lastRefresh"))
    {
        
        energy=window.localStorage.getItem("energy");
    pb=window.localStorage.getItem("pb");
    gb=window.localStorage.getItem("gb");
    ub=window.localStorage.getItem("ub");
    mb=window.localStorage.getItem("mb");
        var array = window.localStorage.getItem("lastRefresh").split(",");
        var lastDay = array[0];
        var d = new Date();
        var currentDay = d.toDateString();
        var currentDateTime = d.toDateString()+", "+d.toLocaleTimeString().toString();
        if(lastDay==currentDay)
        {
         
            var lastHour = stripHour(array[1]);
            var currentHour = stripHour(d.toLocaleTimeString().toString());
            if((currentHour-lastHour)>0)
            {
             
                setEnergy();
//                alert('Same day, more than an hour refreshTime set as '+currentDateTime);
                window.localStorage.setItem("lastRefresh", currentDateTime);
            }
            else
            {
             
                displayInventory();
            }
        }
        else
        {
         
            setEnergy();
//            alert('More than a day refreshTime set as '+currentDateTime);
                window.localStorage.setItem("lastRefresh", currentDateTime);
        }
        
    }
    else
    {
        var d = new Date();
        d=d.toDateString()+", "+d.toLocaleTimeString().toString();
//        alert('Setting new refreshTime '+d);
        window.localStorage.setItem("lastRefresh", d);
        setEnergy();
    }
    
    
}

function stripHour(time)
{
    
    
    var hour = time.split(":");//hour[0] gives hour
    return hour[0];
}

function setEnergy()
{
    pb=0;
    gb=0;
    ub=0;
    mb=0;
    energy=100;
    var ran;
    for(var i=0;i<20;i++)
    {
        ran=Math.random();
        if(ran<0.8)
        {
         pb++;   
        }
        else if(ran<0.9)
        {
         gb++;
        }
        else if(ran<0.97)
        {
         ub++;   
        }
        else if(ran<1)
        {
         mb++;    
        }
            
    }
    
    window.localStorage.setItem("energy", 100);
    window.localStorage.setItem("pb", pb);
    window.localStorage.setItem("gb", gb);
    window.localStorage.setItem("ub", ub);
    window.localStorage.setItem("mb", mb);
    displayInventory();
}


function displayInventory()
{
 
    $('#energyCount').html(window.localStorage.getItem("energy"));
    $('#pbCount').html(window.localStorage.getItem("pb"));
    $('#gbCount').html(window.localStorage.getItem("gb"));
    $('#ubCount').html(window.localStorage.getItem("ub"));
    $('#mbCount').html(window.localStorage.getItem("mb"));
}






/////////////////select ball////////////////////////////////
function selectBall(ball)
{
    playAudio(store+'effects/pickup.mp3');
     switch(ball)
     {
        case 'pb':

             if(pb>0)
            {

                selectedBall=0;
                
                $('.ballSelector').removeClass('tdSelect');
                $('#pbSelectTD').addClass('tdSelect');
            }
             break;
             
        case 'gb':
             if(gb>0)
            {

                selectedBall=1;
                
                $('.ballSelector').removeClass('tdSelect');
                $('#gbSelectTD').addClass('tdSelect');
            }
             break;
             
        case 'ub':
             if(ub>0)
            {

                selectedBall=2;
                
                $('.ballSelector').removeClass('tdSelect');
                $('#ubSelectTD').addClass('tdSelect');
            }
             break;
             
        case 'mb':
             if(mb>0)
            {

                selectedBall=3;
                
                $('.ballSelector').removeClass('tdSelect');
                $('#mbSelectTD').addClass('tdSelect');
            }
             break;

     }
}
//////////////////////////////////////Get Party/////////////////////////////////////////////////
function getParty()
{
    //alert('getParty Called');
     $.ajax({
                  method: 'post',
                  url: link+"pokemaster/showParty.php",
                  data: {
                    'trainer_id': window.localStorage.getItem("loginid")
                  },
                  success: function(data) {
                    //alert(data);
                       var obj = eval ("(" + data + ")");
                      partyObj = obj;//partyobj has all the pkmn in user's party. Use this obj to check if encountered is already captured. Make sure to call getParty() initially, as well as after a capture is successful to set partyObj.
                      if((obj.success==1)||(obj.success==0))
                      {
                          
                          populateParty();
                          
                       
                      }
                      
                  },
                error: function(xhr,status,error) {
                 
                    //alert(error);
                }
        
                });
}

function showParty()
{
  
  nav('partyBox');
  populateParty();
}

function populateParty()
{
    $('#partyDiv').html("");
    if(partyObj.success==0)
    {
        $('#partyDiv').html("Go back and start catching some monsters!");
    }
    else
    {
        for(var i=0;i<partyObj.pokemon.length;i++)
        {

            $('#partyDiv').append("<img src='"+pokemonJsonObj[partyObj.pokemon[i].pkmn_index].img+"' class='partyFlap' onclick='showPkmnDetails("+[i]+")'>");
        }
    }
   var level = calculateLevel(partyObj.points);
    //alert('level:'+level);
    displayLevel(level);
    
}

/////////////////////////////////calculateLevel//////////////////////////////////

function calculateLevel(points)
{
 
    //Just show points//
    $('.points').html(points);
    if(points>100000)
    {
     
        $('.card').css("background-color","#FF8A80");
        return 9;
    }
    else if(points>50000)
    {
     
        $('.card').css("background-color","#EA80FC");
        return 8;
    }
    else if(points>25000)
    {
     
        $('.card').css("background-color","#B388FF");
        return 7;
    }
    else if(points>12500)
    {
     
        $('.card').css("background-color","#80D8FF");
        return 6;
    }
    else if(points>6250)
    {
     
        $('.card').css("background-color","#A7FFEB");
        return 5;
    }
    else if(points>3125)
    {
        $('.card').css("background-color","#CCFF90");
        return 4;
    }
    else if(points>1562)
    {
     
        $('.card').css("background-color","#FFFF8D");
        return 3;
    }
    else if(points>781)
    {
     
        $('.card').css("background-color","#FFD180");
        return 2;
        
    }
    else
    {
     
        $('.card').css("background-color","#90A4AE");
        return 1;
    }
    
}


//////////////////////////////display level//////////////////////////////
function displayLevel(level)
{

    
    $('.level').html("Lv."+level);
    if(!levelDispFlag)
    {
        
        levelDispFlag=true;
    }
    else
    {
        if(level>userLevel)
        {
            plert('You\'ve been elevated to Level '+level,alertDismissed,'Congratz!','OK');
        }
    }
    userLevel = level;
    $('#starSpot').html("");
    for(var i=0;i<userLevel;i++)
    {
    $('#starSpot').append("<img src='"+store+"Featured-star.png' class='smallIcon'>");
    }
}

////////////////////////Check if pkmn is already in party////////////////////////////////////
function isInParty(pkmnIndex)
{
    if(partyObj.success==1)
    {
        for(var i=0;i<partyObj.pokemon.length;i++)
        {

            if(pkmnIndex==partyObj.pokemon[i].pkmn_index)
            {

                return true;
            }
        }
        return false;
    }
    else
    {
        return false;   
    }
    
}


/////////////////////////////////Show pokemon details from party//////////////////////////////////
function showPkmnDetails(index)//index is that of partyObj.
{
    
    nav('detailPage');
    $('#pokemonImg_detailPage').attr("src",pokemonJsonObj[partyObj.pokemon[index].pkmn_index].img);
    $('#pkmnName_detailPage').html(pokemonJsonObj[partyObj.pokemon[index].pkmn_index].name);
    playAudio(link+'pokemaster/data/cries/'+pokemonJsonObj[partyObj.pokemon[index].pkmn_index].id+'.wav');
    
    $('#pkmnType_detailPage').html("");
    for(var i=0;i<pokemonJsonObj[partyObj.pokemon[index].pkmn_index].type.length;i++)
    {
    $('#pkmnType_detailPage').append(pokemonJsonObj[partyObj.pokemon[index].pkmn_index].type[i]);
        if(i<pokemonJsonObj[partyObj.pokemon[index].pkmn_index].type.length-1)
            $('#pkmnType_detailPage').append(", ")
    }
    $('#pkmnSpcs_detailPage').html(pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.classification);
    $('#pkmnHeight_detailPage').html(pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.height);
    $('#pkmnWeight_detailPage').html(pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.weight);
    
    $('#pkmnAbility_detailPage').html("");
    for(var i=0;i<pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.abilities.normal.length;i++)
    {
    $('#pkmnAbility_detailPage').append(pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.abilities.normal[i]);
        if(i<pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.abilities.normal.length-1)
            $('#pkmnAbility_detailPage').append(", ")
    }
    
    for(var i=0;i<pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.abilities.hidden.length;i++)
    {
        $('#pkmnAbility_detailPage').append(", ")
    $('#pkmnAbility_detailPage').append(pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.abilities.hidden[i]+" (hidden ability)");
        if(i<pokemonJsonObj[partyObj.pokemon[index].pkmn_index].misc.abilities.hidden.length-1)
            $('#pkmnAbility_detailPage').append(", ")
    }
    
    $('#foundDetail').html("Caught from : "+partyObj.pokemon[index].location+"<br/>On : "+partyObj.pokemon[index].date);
}


////////////////////////////////Download pokemon json. Need 'File' and 'FileTransfer' plugins////////////////////////////////

//The directory to store data
var store;

//Used for status updates
var $status;

//URL of our asset
var assetURL = link+"pokemaster/data/";

//File name of our important data file we didn't ship with the app
var fileName = ["pokemonJson.json","Poke%20Ball.png","ball.png","Featured-star.png","Great%20Ball.png","Master%20Ball.png","Ultra%20Ball.png","hologram.png","seal.png","pb_lit.png","gb_lit.png","ub_lit.png","mb_lit.png","effects/pokemonCaught.mp3","effects/pokemonEscape.mp3","effects/pokeballThrow.mp3","effects/pokeballWobble.mp3","effects/pickup.mp3","logout.png","myparty.png","trainer.png","scan.png"];
var currentFileIndex = 0;
var requiredFile;

function downloadInit() {
	
	//$status = document.querySelector("#status");

	//$status.innerHTML = "Checking for data file.";

	store = cordova.file.dataDirectory;
    getFiles(currentFileIndex);
	//Check for the file. 
	cordova.plugin.pDialog.init({theme : "HOLO_LIGHT", progressStyle : 'HORIZONTAL', title: 'Please Wait..', message : 'Downloading assets...'});
    cordova.plugin.pDialog.setCancelable(false);
}

function getFiles(i)
{
    requiredFile = fileName[i];
    window.resolveLocalFileSystemURL(store + requiredFile, appStart, downloadAsset);
}
function downloadAsset() {
	var fileTransfer = new FileTransfer();
	//alert("About to start transfer");
    // needs plugin spinnerDialog
    /*window.plugins.spinnerDialog.hide();
    window.plugins.spinnerDialog.show("Downloading assets",currentFileIndex+1+"/"+fileName.length, true);*/
    
    
    cordova.plugin.pDialog.setProgress(parseInt((currentFileIndex+1)*100/(fileName.length)));
	fileTransfer.download(assetURL + requiredFile, store + requiredFile, 
		function(entry) {
			//alert("Success!");
			appStart();
		}, 
		function(err) {
        
            //window.plugins.spinnerDialog.hide();
        cordova.plugin.pDialog.dismiss();
        alert('Something went wrong. Restart app later to continue download..');
		
			console.dir(err);
		});
}

//I'm only called when the file exists or has been downloaded.
function appStart() {
    
    
    if(currentFileIndex < fileName.length-1)
    {
     currentFileIndex+=1;
        getFiles(currentFileIndex);
        
    }
    else
    {
     
        
	//alert("Safe to parse json!");
    //window.plugins.spinnerDialog.hide();
        cordova.plugin.pDialog.dismiss();
    $.get(store + fileName[0], function(data) {
   pokemonJsonObj = eval ("(" + data + ")");       //everything there in obj
               //alert(obj[0].id);      //proper way to get id of 0th monster..
}, 'text');
        
        $('.seal').attr("src",store+"seal.png");
        getParty();//initializing user's party.
        $('#scanBtn').attr("src",store+"scan.png");
        $('#myPartyBtn').attr("src",store+"myparty.png");
        $('#trainerBtn').attr("src",store+"trainer.png");
        $('#logoutBtn').attr("src",store+"logout.png");
        
    }
    
    
}

function showToast(type,msg,time)//type:success,info,warning,error
{
 
    
    
    toastr.options = {
  "closeButton": false,
  "debug": false,
  "newestOnTop": false,
  "progressBar": false,
  "positionClass": "toast-bottom-full-width",
  "preventDuplicates": false,
  "onclick": null,
  "showDuration": "300",
  "hideDuration": "300",
  "timeOut": time,
  "extendedTimeOut": "1000",
  "showEasing": "swing",
  "hideEasing": "linear",
  "showMethod": "fadeIn",
  "hideMethod": "fadeOut"
};
    
    toastr[type](msg);
}

//play audio

function playAudio(url) {
    // Play the audio file at url
     my_media = new Media(url,
        // success callback
        function() {
            //alert("playAudio():Audio Success");
        },
        // error callback
        function(err) {
            //alert("playAudio():Audio Error: "+err);
    });

    // Play audio
    my_media.play();
}