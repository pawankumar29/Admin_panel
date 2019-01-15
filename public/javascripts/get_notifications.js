
jQuery(document).ready(function () {
//   get_notification_list();
    get_contact_us_notification_list();
//    setInterval(function () {
//     get_notification_list();
//    }, 40000);
  
    setInterval(function () {
        get_contact_us_notification_list();
    }, 40000);
  

      

 
    function get_notification_list() {
      
        $.ajax({
            url: "/get_notifications",
            type: "GET",
            beforeSend: function () {
              
              },
            success: function (result) {
                
                let data = "";             
                if (result == 'unauthorised')
                    window.location = "/login";
                else {
                   
                    let result_length = result.data.length;
                    let return_array = result.data;
     
                    if (result_length > 0) {
                        var filter_array_unread = return_array.filter(function(e) {
                            return e.is_read == 0;
                          });
                        
                          if(filter_array_unread.length >0){
                              
                             // alert(filter_array_unread.length);
                            
                            for (let i = 0; i < filter_array_unread.length; i++) {
                                 let url = "";
                               
                                let message = "You have recieved a new report about " + filter_array_unread[i].reference_id.recommendation_id.user_id.firstName + " " + filter_array_unread[i].reference_id.recommendation_id.user_id.lastName;
                               url = "/get_notifications/update/" + filter_array_unread[i]._id;           
                                    data = data + '<li style="background:#E9ECF1; font-size:10px;"><a href=' + url + ' style = "color:#2D3944; padding:2px;" ><span class="details bold"><span class="label label-sm label-success"><i class="fa fa-user"></i></span>' + message + '<br><span class="bold pull-right">' + moment(filter_array_unread[i].created_at).utcOffset(moment.tz.guess()).format('DD-MM-YYYY hh:mm A') + '</span></span></a></li>';                           
                                    $('#notification_count').text(filter_array_unread.length); 
                                   
                            }
                            

                          }
                          else{
                            $('#notification_count').text("");
                            $("#mark_all_as_read").hide();
                          }
                          
                          //set pending count
                          $("#notification_pending_count").text(filter_array_unread.length);
                          var filter_array_read = return_array.filter(function(e) {
                            return e.is_read == 1;
                          });
                          
                          if(filter_array_read.length >0){
                            
                           // alert(filter_array_read.length);
                            for (let i = 0; i < filter_array_read.length; i++) {
                                let url = "";
                              let message = "You have recieved a new report about " + filter_array_read[i].reference_id.recommendation_id.user_id.firstName + " " + filter_array_read[i].reference_id.recommendation_id.user_id.lastName;
                                url = "/get_notifications/update/" + filter_array_read[i]._id;           
                                    data = data + '<li style="color:#343333;font-size:10px;"><a href=' + url + ' style = "padding:2px;"><span class="details bold"><span class="label label-sm label-success"><i class="fa fa-user"></i></span>' + message + '<br><span class="bold pull-right">' + moment(filter_array_read[i].created_at).utcOffset(moment.tz.guess()).format('DD-MM-YYYY hh:mm A') + '</span></span></a></li>';                           
                                   
                            }

                          }
                                      
                    }

                    else {
                        data = ` <li class="external">
                        <h6><span class="bold" style='color:"#B0B0B0"' >No new notifications available</span></h6>
                        <br> </li> `;
                        $('#notification_count').text("");
                    }
                    $('#notification_content').html(data);
                }

            },
            complete: function (xhr, stat) {
                
              }
        });
       

    }

    $(document).on("click", "#mark_all_as_read", function () {
        $.ajax({
            url: "/get_notifications/all_mark_as_read",
            type: "GET",
             // beforeSend: function () {
              
        // },
        success: function (result) {
       
            if (result == 'unauthorised')
                window.location = "/login";
            else if(result.status == 1)
            {
               
                window.location="/reviews/"
            }
        }
        // , complete: function (xhr, stat) {
                
        // }
        });
    });




//contact us notifications

    function get_contact_us_notification_list() {
       
        
        $.ajax({
            url: "/get_contact_messages",
            type: "GET",
            beforeSend: function () {
              
            },
            success: function (result) {
               
                let data = "";
              
              
                if (result == 'unauthorised')
                    window.location = "/login";
                else {
                   
                    let result_length = result.data.length;
                    let return_array = result.data;
//                    console.log("result_length");
//                    console.log(result_length);
//                    console.log("return_array");
//                    console.log(return_array);
                    if (result_length > 0) {
                       
                        var filter_array_unread = return_array.filter(function(e) {
                            return e.is_read == 0;
                          });
//                        console.log("filter_array_unread");
//                        console.log(filter_array_unread);
                          if(filter_array_unread.length >0){
                             // alert(filter_array_unread.length);
                            
                            for (let i = 0; i < filter_array_unread.length; i++) {
                                 let url = "";
                                let message = "You have recieved a new query from " + filter_array_unread[i].user.firstName + " " + filter_array_unread[i].user.lastName;
                               url = "/get_contact_messages/update/" + filter_array_unread[i]._id;           
                                    data = data + '<li style="background:#E9ECF1;font-size:10px;"><a href=' + url + ' style = "color:#2D3944; padding:2px" ><span class="details bold"><span class="label label-sm label-success"><i class="fa fa-user"></i></span>' + message + '<br><span class="bold pull-right">' + moment(filter_array_unread[i].created_at).utcOffset(moment.tz.guess()).format('DD-MM-YYYY hh:mm A') + '</span></span></a></li>';                           
                                    $('#contact_request_count').text(filter_array_unread.length); 
                                   
                            }
                            

                          }
                          else{
                            $('#contact_request_count').text("");
                            $("#contact_mark_all_as_read").hide();
                          }
                          
                          //set pending count
                          $("#contact_request_pending_count").text(filter_array_unread.length);
                          var filter_array_read = return_array.filter(function(e) {
                            return e.is_read == 1;
                          });
                          
                          if(filter_array_read.length >0){
                           // alert(filter_array_read.length);
                            for (let i = 0; i < filter_array_read.length; i++) {
                                let url = "";
                              let message = "You have recieved a new query from " + filter_array_read[i].user.firstName + " " + filter_array_read[i].user.lastName;
                                url = "/get_contact_messages/update/" + filter_array_read[i]._id;           
                                    data = data + '<li style="color:#343333;font-size:10px;"><a href=' + url + ' style = "padding:2px"><span class="details bold"><span class="label label-sm label-success"><i class="fa fa-user"></i></span>' + message + '<br><span class="bold pull-right">' + moment(filter_array_read[i].created_at).utcOffset(moment.tz.guess()).format('DD-MM-YYYY hh:mm A') + '</span></span></a></li>';                           
                                 
                            }

                          }
                      
                    }

                    else {
                        data = ` <li class="external">
                        <h6><span class="bold" style='color:"#B0B0B0"'>No new notifications available</span></h6>
                        <br> </li> `;
                        $('#contact_request_count').text("");
                    }
                   
                    $('#contact_request_content').html(data);
                }

            },
            complete: function (xhr, stat) {
                
              }
        });
        

    }



});
//mark all as read
$(document).on("click", "#contact_mark_all_as_read", function () {
    $.ajax({
        url: "/get_contact_messages/all_mark_as_read",
        type: "GET",
        // beforeSend: function () {
              
        // },
        success: function (result) {
            
            if (result == 'unauthorised')
                window.location = "/login";
            else if(result.status == 1)
            {
               
                window.location="/contact_us"
            }
        }
        // , complete: function (xhr, stat) {
                
        // }
    });
});


