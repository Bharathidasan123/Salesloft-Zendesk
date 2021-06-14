$(function() {
  var client = ZAFClient.init();
  client.invoke('resize', { width: '100%', height: '400px' });
  
  showStart();
  
  $("#get-tasks").click(function () {
    getTaskData(client);
  });    
  
});

function showStart() {
  var source = $("#start-hdbs").html();
  var template = Handlebars.compile(source);
  var html = template();
  $("#content").html(html);
};


function getTaskData(client) {    
  var client = ZAFClient.init();
    
  client.get('ticket.requester.email').then(function (response) {  
    var validEmail = response['ticket.requester.email'];    
    
    var settings = {
      
      url: 'https://api.salesloft.com/v2/people.json?email_addresses='+validEmail,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer {{setting.token}}'
      },
      secure: true,
      type: 'GET',
      dataType: 'json',
      
    };    
    
    var client = ZAFClient.init();
    client.request(settings).then(function (response) {
      var responseParse = response.data;
      var responseDisplay = responseParse[0];      
      var responseSalesloft = responseDisplay;      
      var responseSalesloftEmpty = $.isEmptyObject(responseSalesloft);       
      
      if(responseSalesloftEmpty){
        responseActiveCampaignEmptyData()                
      } 
      else {
        processResponse(responseSalesloft);               
      }   
    },
    function (response) {
      console.log(response);
    }
    );
  });
}

// >>>>>>>>>>>>>>>>>ADD DATA FUNCTION>>>>>>>>>>>>>>>>>

function responseActiveCampaignEmptyData(){    
  $("#noDataText").show();
  $("#addDataButton").show(); 
  $("#noData").append(noDataText);
  var addBtn = $("#btn").append(btn);   
};

// >>>>>>>>>>>>>>>>>RESPONCE DATA FUNCTION>>>>>>>>>>>>>>>>>

function processResponse(responseActivCampaign) {     
  
  $.each(responseActivCampaign, function (key, val) {        
    if(typeof val == "object"){
      processResponse(val);
    }
    else {           
      var temp = $('<div class="container" id="temp"><div class="row border-bottom m-2 p-2 font"><div style="flex-flow:nowrap; font-size:13px;" class="col-sm-2 fS" id="tempKey"></div><div style="font-size:13px;" class="col-sm-2 fontStyle" id="valDisplay"></div></div></div>');
      $(temp).find("#tempKey").text(key);
      $(temp).find("#valDisplay").text(val);
      $("#resdata").append($(temp));
      $("#noDataText").hide();
      $("#addDataButton").hide();
      $("#get-tasks").hide();
    };       
  });   
};

// >>>>>>>>>>>>>>>>>ADD DATA CLICK FUNCTION>>>>>>>>>>>>>>>>>

function showAddForm(){
  
  $("#noDataText").hide();
  $("#addDataButton").hide();        
  $("#showAddForm").show();    
  inputValueForShowAddForm();   
};


// >>>>>>>>>>>>>>>>>ADD DATA, SHOW FORM, AUTO UPDATE>>>>>>>>>>>>>>>>>

function inputValueForShowAddForm() {
  
  var client = ZAFClient.init();
  client.get('ticket.requester.email').then(function (data) {
    var activeCampaignEmail = data["ticket.requester.email"]
    if(activeCampaignEmail != null){
      $("#email").val(activeCampaignEmail);
    };  
  });
  
  var client = ZAFClient.init();
  client.get('ticket.requester.name').then(function (data) {
    var activeCampaignLastName = data["ticket.requester.name"]
    if(activeCampaignLastName != null){
      $("#lastName").val(activeCampaignLastName);
    };  
  });
  
  var client = ZAFClient.init();
  client.get('ticket.requester.phone').then(function (data) {
    var activeCampaignPhone = data["ticket.requester.phone"]
    if(activeCampaignPhone != null){
      $("#phone").val(activeCampaignPhone);
    }
    
  });     
};

// // >>>>>>>>>>>>>>>>>ADD DATA, VALUE GET AND SUBMIT OR UPLOAD >>>>>>>>>>>>>>>>>
function submitData(){
  
  var addName = $("#lastName").val();
  var addEmail = $("#email").val();
  var addPhone = $("#phone").val();
  
  addName = $.trim(addName);
  addEmail = $.trim(addEmail);
  
  if(IsEmail(addEmail)==false){
    $('#emailNotValid').show();
    return false;
  }
  function IsEmail(addEmail) {
    var regex = /^([a-zA-Z0-9_\.\-\+])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    if(!regex.test(addEmail)) {
      return false;
    }else{
      return true;
    }    
  };
  
  var params = {
    "last_name": addName,
    "email_address": addEmail,
    "phone": addPhone
  };  
  
  var reqObject = {
    url: 'https://api.salesloft.com/v2/people.json',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer {{setting.token}}'
    },
    secure: true,
    type: 'POST',    
    dataType: 'json',
    data: JSON.stringify(params),    
  };
  
  if (addEmail) {
    var client = ZAFClient.init();
    client.request(reqObject).then(function (data) {
      $("#showAddForm").hide();                   
      $("#successMessage").show();
      setTimeout(function() { $("#successMessage").hide(); }, 1000);
      getTaskData(client);            
    }).catch(function(err){
      // Error handling
      console.log(err);       
    });
    
  }	
  else {        
    $("#emailNotValid").show();
    submitData();
    return (false)        
  }
}

function cancelPage(){
  $("#showAddForm").hide();
  location.reload();
  getTaskData(client);
  
}