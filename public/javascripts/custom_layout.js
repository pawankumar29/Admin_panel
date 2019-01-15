
Metronic.init(); // init metronic core componets
Layout.init(); // init layout
Index.init();
Tasks.initDashboardWidget();
QuickSidebar.init(); // init quick sidebar


//on load elements

jQuery(document).ready(function () {

    var d = new Date();
    var n = d.getFullYear();
    $("#year").html(n);  
   /*  $.cookie("time_zone_name", moment.tz.guess()); */
      
    //ajax setup
    $.ajaxSetup({
        beforeSend: function () {
          addLoader("body");
        },
        error: function (xhr, status, error) {
        
            alertify.set('notifier','delay', 5);
            alertify.set('notifier', 'position', 'top-right');
            if (xhr.responseJSON) {

                alertify.error("Error : " + xhr.responseJSON.error);
            } else {
                
                if(xhr.status){
                    alertify.error("An error occured: " + xhr.status + " " + xhr.statusText);
                }
               
                // alertify.error(xhr.statusText);
            }                                       
        },
        complete: function (xhr, stat) {
          removeLoader("body");
        },
       timeout: 30000 // sets timeout to 30 seconds
    });


    //fade out the alert
    $(".alert").fadeOut(10000);
   /*  $.cookie("time_zone_name", moment.tz.guess()); */
    
//    removeLoader(".loader");
});


        