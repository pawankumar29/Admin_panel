jQuery(document).ready(function () {
    $(document).scroll(function (e) {
//      if (processing)
//            return false;
        var scrollHeight = $(document).height();
        var scrollPosition = $(window).height() + $(window).scrollTop();
        if ((scrollHeight - scrollPosition) / scrollHeight === 0) {
//            processing = true;
//            var filter_data = $("form[name=filter_handset]").serialize();
            alert("Next Page");

//            var page = $(this).attr("page");
            var str = $("form").serialize();
            var url = $("#url").val();
            var page = parseInt($("#current_page").val()) + 1;

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
                        console.log(result);
                        $("#current_page").val(page)
                        $("#ajaxResponce").append(result);
//                Metronic.init(); // init metronic core components
                    }
                }
            });
        }
    });
});