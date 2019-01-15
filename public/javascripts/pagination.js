
$(document).on("click", ".pagination a", function () {
    var page = $(this).attr("page");
    var str = $("form").serialize();
    var url = $("#url").val();
   
    $.ajax({
        url: url + '?' + str,
        type: "GET",
        data: {page: page},
        success: function (result) {
            
            if (result == 'unauthorised')
            {
                window.location = "/login";
            } else
            {

                $("#ajaxResponce").html(result);
                Metronic.init(); // init metronic core components
            }
        }
    });
});

