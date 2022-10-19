jQuery(document).ready(function () {
    // set local timezone offset in cookies
    var time_zone_offset = -(new Date().getTimezoneOffset());
    $.cookie("time_zone_offset", moment.tz.guess());
    // add methods for validation
    $.validator.addMethod('filesize', function (value, element, param) {
        return this.optional(element) || (element.files[0].size <= param)
    }, "Invalid file Size");
    $.validator.addMethod('min_filesize', function (value, element, param) {
        return this.optional(element) || (element.files[0].size >= param)
    }, "Invalid file Size");
    $.validator.addMethod("match", function (value, element, param) {
        return this.optional(element) || param.test(value);
    }, "This field must contain only letters, numbers, space or dashes");
    $.validator.addMethod("regex", function (value, element, regexpr) {
        return regexpr.test(value);
    }, "Enter a valid");
    $("#email").focus();
    $("#password").focus();

    $(".alert").fadeOut(10000);

    function dateConvert(str) {
        var date = new Date(str),
                mnth = ("0" + (date.getMonth() + 1)).slice(-2),
                day = ("0" + date.getDate()).slice(-2);
        return [mnth, day, date.getFullYear()].join("/");
    }

    $('#getEmail-form').validate({
        focusInvalid: false,
        onkeyup: false,
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            email: {
                required: {
                    depends: function () {
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                },
                maxlength: 50,
                match: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
                        //                match: /^[a-z0-9_\-]+(\.[_a-z0-9\-]+)*@([_a-z0-9\-]+\.)+([a-z]{2}|biz|com|edu|gov|info|net|org)$/
            }
        },
        messages: {
            email: {
                required: "Please enter a valid email address.",
                maxlength: "E-mail maximum length is 50.",
                match: "Please enter a valid email address.",
            }
        }
    });
    $('.login-form').validate({
        focusInvalid: false,
        onkeyup: false,
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            email: {
                required: {
                    depends: function () {
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                },
                maxlength: 50,
                match: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/
                        //                match: /^[a-z0-9_\-]+(\.[_a-z0-9\-]+)*@([_a-z0-9\-]+\.)+([a-z]{2}|biz|com|edu|gov|info|net|org)$/
            },
            password: {
                required: true
            },
            captcha: {
                required: true
            }
        },
        messages: {
            email: {
                required: "Enter e-mail.",
                maxlength: "E-mail maximum length is 50.",
                match: "Enter valid e-mail.",
            },
            password: {
                required: "Enter password."
            },
            captcha: {
                required: "Enter captcha code."
            }
        }
    });
    $(".forgot-form").validate({
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            email: {
                required: {
                    depends: function () {
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                },
                maxlength: 50,
                match: /^[a-z0-9_\-]+(\.[_a-z0-9\-]+)*@([_a-z0-9\-]+\.)+([a-z]{2}|biz|com|edu|gov|info|net|org)$/
            }
        },
        messages: {
            email: {
                required: "Enter e-mail.",
                maxlength: "E-mail maximum length is 50.",
                match: "Enter valid e-mail."
            }
        }
    });
    $('.changePassword-form').validate({
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            currentPassword: {
                required: true
            },
            newPassword: {
                required: true,
                rangelength: [8, 16],
                match: /^(?=.*\d)(?=[\w!@#$%^&*()+]{8,})(?:.*[!@#$%^&*()+]+.*).*$/
            },
            confirmPassword: {
                required: true,
                equalTo: "#newPassword"
            }
        },
        messages: {
            currentPassword: {
                required: "Enter current password."
            },
            newPassword: {
                required: "Please enter a new password.",
                rangelength: "PLease enter a new password between 8 to 16 characters. Your password should include letters, numbers and special characters.",
                match: "Enter a password between 8 to 16 characters. Your password should include letters, numbers and special characters."
            },
            confirmPassword: {
                required: "Please confirm  the password.",
                equalTo: "The passwords you have entered do not match."
            }
        }
    });

    $('.resetPwd-form').validate({
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            password: {
                required: true,
                rangelength: [8, 16],
                match: /^(?=.*\d)(?=[\w!@#$%^&*()+]{8,})(?:.*[!@#$%^&*()+]+.*).*$/
            },
            password_confirmation: {
                required: true,
                equalTo: "#password"
            }
        },
        messages: {
            password: {
                required: "Enter new password.",
                rangelength: "Enter a password between 8 to 16 characters. Your password should include letters, numbers and special characters.",
                match: "Enter a password between 8 to 16 characters. Your password should include letters, numbers and special characters."
            },
            password_confirmation: {
                required: "Confirm new password.",
                equalTo: "The passwords you have entered do not match."
            }
        }
    });

    $(document).on("click", "#checkAll", function () {
        $(".check").prop('checked', $(this).prop('checked'));
        if ($(this).prop('checked'))
            $(".check").parent().prop('class', 'checked');
        else
            $(".check").parent().prop('class', '');
    });

    $(document).on("click", ".custom_close", function () {
        console.log("clicked");
        $(this).parent("span.chip").remove();
        if ($(".custom_close").length == 0) {
            $(".chipcontainer").html("<h1 style='color:red'><b>PLease select atleast one college</b></h1>")
        }
        $(".save").attr("disabled", true)
    });
    $('#enable_test').click(function () {
        $(".save").attr("disabled", false)
        if ($('.check:checked').length == 0) {
            bootbox.alert("Select atleast One institute to enable the test!");
        } else {
            let checkedData = $('.check:checked').serializeArray()
            let text = "";
            checkedData.forEach(function (obj) {
                text = text + "<span class='chip' data-value='" + obj.value + "'>" + obj.name + "<span class='custom_close'><i class='fa fa-remove' aria-hidden='true'></i></span></span>"
            });
            $(".chipcontainer").html(text);
            $("#enable_test_modal").modal("show");
        }
    });
    $('#enable_test_walkings').click(function () {
        $(".save").attr("disabled", false)
        if ($('.check:checked').length == 0) {
            bootbox.alert("Select atleast One Walkings to enable the test!");
        } else {
            let checkedData = $('.check:checked').serializeArray()
            let text = "";
            checkedData.forEach(function (obj) {
                text = text + "<span class='chip' data-value='" + obj.value + "'>" + obj.name + "<span class='custom_close'><i class='fa fa-remove' aria-hidden='true'></i></span></span>"
            });
        
            $(".chipcontainer").html(text);
            $("#enable_test_modal").modal("show");
        }
    });
    $('.save').click(function (e) {
        e.preventDefault();
//        $(".date").removeAttr("readonly");
//        $(".time").removeAttr("readonly");
        let arrayIds = [];
        $(".chip").each(function (index) {
            arrayIds.push($(this).data("value"));
        });
        let date = $(".date").data("value");
        date = dateConvert(date);
        let time = $(".time").val();
//        $(".enable_quiz_form").submit();
        let dateMessage = '';
        let timeMessage = '';
        if (date == null) {
            dateMessage = "Please select the date for the test."
        } else if (!moment(date, "MM/DD/YYYY").isValid()) {
            dateMessage = 'Please enter the date in valid format.';
        }

        if (time == null) {
            timeMessage = "Please select the time for the test.";
        } else if (!moment(time, "h:mm a").isValid()) {
            timeMessage = "Please enter time in valid format";
        }

        if (dateMessage && timeMessage) {
            $(".date-error").html(dateMessage);
            $(".time-error").html(timeMessage);
        } else if (dateMessage) {
            $(".date-error").html(dateMessage);
        } else if (timeMessage) {
            $(".time-error").html(timeMessage);
        } else {
            let datetime = date + " " + time;
            datetime = moment(datetime, "MM/DD/YYYY h:mm a").toISOString();
            $.ajax({
                url: "/quiz",
                type: "POST",
                data: {
                    id: arrayIds,
                    previousInstruction: datetime,
                },
                dataType: 'JSON',
                success: function (result) {
                    if (result == 'unauthorised') {
                        window.location = "/login";
                    } else if (result["status"] == 1) {
                        window.location = "/institutes";
                    }
                },
//                error: function (xhr, status, error) {
////                    window.location = "/institutes";
//                    alertify.set('notifier', 'delay', 5);
//                    alertify.set('notifier', 'position', 'top-right');
//                    if (xhr.responseJSON) {
//                        alertify.error("Error : " + xhr.responseJSON.error);
//                    } else {
//                        if (xhr.status) {
//                            alertify.error("An error occured: " + xhr.status + " " + xhr.statusText);
//                        }
//                    }
//                },
            });
        }
//        $(".date").attr("readonly", true);
//        $(".time").attr("readonly", true);
    });
//    $(".enable_quiz_form").validate({
//        rules: {
//            date: {
//                required: true
//            },
//            time: {
//                required: true,
//            }
//        },
//        focusInvalid: false,
//        invalidHandler: function (form, validator) {
//            var errors = validator.numberOfInvalids();
//            if (errors) {
//                validator.errorList[0].element.focus();
//            }
//        },
//        messages: {
//            date: {
//                required: "Please select the test date."
//            },
//            time: {
//                required: "Please select the test time."
//            }
//        }
//    });
    //form validation for category-add-Edit
//    $(".category-form").validate({
//        focusInvalid: false,
//        invalidHandler: function (form, validator) {
//            var errors = validator.numberOfInvalids();
//            if (errors) {
//                validator.errorList[0].element.focus();
//            }
//        },
//        rules: {
//            name: {
//                required: true,
//                rangelength: [3, 100],
//                match: /^[a-zA-Z ]*$/,
//            }
//        },
//        messages: {
//            name: {
//                required: "Enter category name.",
//                rangelength: "Enter category name between 3 to 100 characters.",
//                match: "Enter only letters."
//            }
//
//        }
//    });
    $(".profile-form").validate({
        focusInvalid: false,
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            name: {
                match: /^[a-z,0-9,'-]+$/i,
                rangelength: [3, 20],
                required: true
            },
            photo: {
                extension: "jpg|jpeg|png",
                filesize: 10000000
            }
        },
        messages: {
            name: {
                required: "Enter first name.",
                rangelength: "Enter first name between 3 to 20 characters.",
                match: "Enter only numbers and letters."
            },
            photo: {
                extension: "Supported Image format jpeg, png.",
                filesize: "Maximum file size 10 MB."
            }
        }
    });
    //form validation for disable user
//    $("#disableUser-form").validate({
//        focusInvalid: false,
//        invalidHandler: function (form, validator) {
//            var errors = validator.numberOfInvalids();
//            if (errors) {
//                validator.errorList[0].element.focus();
//            }
//        },
//        rules: {
//            reason: {
//                required: true,
//                minlength: 10,
//                maxlength: 500
//            }
//        },
//        messages: {
//            reason: {
//                required: "Enter reason.",
//                maxlength: "Please enter a valid reason between 10-500 chracters.",
//                maxlength: "Enter reason of max 500 characters only."
//            }
//        }
//    });
//    //form validation for settings
//    $("#settings-form").validate({
//        focusInvalid: false,
//        invalidHandler: function (form, validator) {
//            var errors = validator.numberOfInvalids();
//            if (errors) {
//                validator.errorList[0].element.focus();
//            }
//        },
//        rules: {
//            android_version: {
//                required: true,
//                number: true,
//                max: 5
//            },
//            ios_version: {
//                required: true,
//                number: true,
//                max: 5
//            }
//
//        },
//        messages: {
//            android_version: {
//                required: "Android version is required.",
//                number: "Please enter number.",
//                max: "You can enter max 5 numbers."
//            },
//            ios_version: {
//                required: "IOS version is required.",
//                number: "Please enter number.",
//                max: "You can enter max 5 numbers."
//            }
//
//        }
//    });
    // $("#settings-form").validate({
    //     focusInvalid: false,
    //     invalidHandler: function (form, validator) {
    //         var errors = validator.numberOfInvalids();
    //         if (errors) {
    //             validator.errorList[0].element.focus();
    //         }
    //     },
    //     rules: {
    //         near_by: {
    //             required: true,
    //             number: true,
    //             max: 1000000
    //         },
    //         algorithm_distance: {
    //             required: true,
    //             number: true,
    //             max: 1000000
    //         },
    //         version: {
    //             required: true,
    //             number: true,
    //             max: 100
    //         }
    //     },
    //     messages: {
    //         near_by: {
    //             required: "Enter search distance in meters.",
    //             number: "Enter the valid distance.",
    //             max: "You can enter max distance 1000 km."
    //         },
    //         algorithm_distance: {
    //             required: "Enter algorithm distance in meters.",
    //             number: "Enter the valid distance.",
    //             max: "You can enter max distance 1000 km."
    //         },
    //         version: {
    //             required: "Enter app version.",
    //             number: "Enter the valid app version.",
    //             max: "You can enter max app version value 100."
    //         }
    //     }
    // });
    $(document).on("click", "#checkAll", function () {
        $(".check").prop('checked', $(this).prop('checked'));
        if ($(this).prop('checked'))
            $(".check").parent().prop('class', 'checked');
        else
            $(".check").parent().prop('class', '');
    });

    $(document).on("click", ".delete", function () {
        var message = "Are you sure you want to delete?";
        if ($("#url").val() === "/institutes/") {
            message = "Are you sure you want to delete this Institution?";
        }
//        if ($("#url").val() === "/contact_us/") {
//            message = "Are you sure you want to delete the query?";
//        }
//        if ($("#url").val() === "/category/") {
//            message = "Are you sure you want to delete the queries category?";
//        }
//        if ($("#url").val() === "/drive_image/") {
//            message = "Are you sure you want to delete the image?";
//        }
//        if ($("#url").val() === "/pricing_zone/") {
//            message = "Are you sure you want to delete the price of zone?";
//        }
//        if ($("#url").val() === "/states") {
//            message = "Are you sure you want to delete the province?";
//        }
//        if ($("#url").val() === "/cities/") {
//            message = "Are you sure you want to delete the zone?";
//        }
//        if ($("#url").val() === "/pages") {
//            message = "Are you sure you want to delete the cms page?";
//        }
//        if ($("#url").val() === "/reviews") {
//            message = "Are you sure you want to delete?";
//        }

        var deleteLink = $(this).attr('deleteLink');
        bootbox.confirm(message, function (result) {
            if (result) {
                window.location = deleteLink;
            }
        });
    });

//    $('#deleteSelected').click(function () {
//        if ($('.check:checked').length == 0)
//            bootbox.alert("Select Atleast One!");
//        else {
//            bootbox.confirm("Are you sure you want to delete?", function (result) {
//                if (result) {
//                    $("#action").val("delete");
//                    $("#frm").submit();
//                }
//            });
//        }
//    });
    $(document).on("click", ".change_status", function () {
        var id = $(this).attr("val");
        var status = $(this).attr("value");
        var obj = $(this);
        var user_type = "";
        var url = "";
//        if ($("#url").val() == "/users/") {
//            user_type = "user";
//            url = "/users/changeStatus";
//        }
        if ($("#url").val() == "/faqs/") {
            user_type = "FAQ";
            url = "/faqs/changeStatus";
        }
//        if ($("#url").val() == "/category/") {
//            user_type = "Category";
//            url = "/category/changeStatus";
//        }
//        if ($("#url").val() == "/drive_image/") {
//            user_type = "Image";
//            url = "/drive_image/changeStatus";
//        }

        var msg = "";
        if (status == 0)
            msg = "Are you sure you want to inactivate this " + user_type + "?";
        else
            msg = "Are you sure you want to activate this " + user_type + "?";
        bootbox.confirm(msg, function (result) {
            if (result) {

                $.ajax({
                    url: url,
                    type: "POST",
                    data: {id: id, status: status},
                    dataType: 'JSON',
                    success: function (result) {

                        if (result == 'unauthorised') {
                            window.location = "/login";
                        } else {
//                            if ($("#url").val() == "/users/") {
//                                window.location = "/users";
//                            }
                            if ($("#url").val() == "/faqs/") {
                                window.location = "/faqs";
                            }
//                            if ($("#url").val() == "/category/") {
//                                window.location = "/category";
//                            }
//                            if ($("#url").val() == "/drive_image/") {
//                                window.location = "/drive_image";
//                            }
                        }
                    }
                });
            }
        });
    });



    $(document).on("click", "#filter", function () {
        var flag = 1;
        
//        if ($("#filterUrl").val() == "/contact_us/") {
//            if (!$("#search_by").val() && !$("#selected_date").val() && !$("#filter_status").val()) {
//                flag = 0;
//                bootbox.alert('Select any filter.');
//            }
//        }
        if ($("#filterUrl").val() == "/faqs/") {
            if (!$("#search_by").val() && !$("#filter_status").val()) {
                flag = 0;
                bootbox.alert('Select any filter.');
            }
        }

        if ($("#filterUrl").val() == "/pages/") {
            if (!$("#search_by").val() && !$("#sort_type").val() && !$("#sort_field").val()) {
                flag = 0;
                bootbox.alert('Select any filter.');
            }
        }
        if ($("#filterUrl").val() == "/emailTemplate/") {
            if (!$("#search_by").val() && !$("#sort_type").val() && !$("#sort_field").val()) {
                flag = 0;
                bootbox.alert('Select any filter.');
            }
        }



        var check_regx = /[`^~<>"')(?*%$]/;
        if ($("#search_by").val() && check_regx.test($("#search_by").val())) {
            flag = 0;
            //            bootbox.alert('Enter only letters or numbers.');
            $("#search_by_error").text("Enter only letters or numbers.").show();
        }
        if ($("#sort_field").val() != "") {
            if ($("#sort_field").val() && $("#sort_type").val() == '') {
                flag = 0;
                bootbox.alert('Select Sort Type.');
            }
        }


        if (flag === 1) {
            $("#search_by_error").hide();
            var str = $("form").serialize();
            var search;
            var url = $("#filterUrl").val();

            $.ajax({
                url: url + '?' + str,
                type: "GET",
                data: {search: 1},
                success: function (result) {

                    if (result == 'unauthorised')
                        window.location = "/login";
                    else
                        $("#ajaxResponce").html(result);
                    Metronic.init(); // init metronic core components
                }
            });
        }
    });


    $("#clear").click(function () {
        $("#filter_form")[0].reset();
        $('#sort_type').val('');
        $("#search_by_error").hide();
        var url = $("#filterUrl").val();
        $.ajax({
            url: url,
            type: "GET",
            data: {search: 1},
            success: function (result) {

                if (result == 'unauthorised')
                    window.location = "/login";
                else {
                    $("#ajaxResponce").html(result);
                    Metronic.init(); // init metronic core components
                }
            }
        });
    });



    function isFloat(n) {
        return Number(n) === n && n % 1 !== 0;
    }


    // Final Code for Download CSV Function
    function download(json_data1) {
        var _log = json_data1;
        var csvData = ConvertToCSV(_log);
        var a = document.createElement("a");
        a.setAttribute('style', 'display:none;');
        document.body.appendChild(a);
        var blob = new Blob([csvData], {type: 'text/csv'});
        var url = window.URL.createObjectURL(blob);
        a.href = url;
        var timestamp = Math.floor(Date.now() / 1000);
        a.download = timestamp + '_data.csv';
        a.click();
    }

    // convert Json to CSV data
    function ConvertToCSV(objArray) {
        var array = typeof objArray != 'object' ? JSON.parse(objArray) : objArray;
        var str = '';
        var row = "";
        for (var index in objArray[0]) {
            //Now convert each value to string and comma-separated
            row += index + ',';
        }
        row = row.slice(0, -1);
        //append Label row with line break
        str += row + '\r\n';
        for (var i = 0; i < array.length; i++) {
            var line = '';
            for (var index in array[i]) {
                if (line != '')
                    line += ','
                line += '"' + array[i][index] + '"';
            }
            str += line + '\r\n';
        }
        return str;
    }

//    $(document).on("click", ".view", function () {
//        /***********user ajax view *******/
//        var url_for_user_view = '';
//        if ($("#url").val() == "/users/") {
//            url_for_user_view = "/users/view";
//        }
//
//        if ($("#url").val() == "/faqs/") {
//            url_for_user_view = "/faqs/view";
//        }
//        if ($("#url").val() == "/category/") {
//            url_for_user_view = "/category/view";
//        }
//        if ($("#url").val() == "/reviews/") {
//            url_for_user_view = "/reviews/view";
//        }
//
//        var user_id = $(this).attr("user_id");
//
//        $.ajax({
//            url: url_for_user_view,
//            type: "POST",
//            data: {id: user_id},
//            dataType: "JSON",
//            success: function (result) {
//
//                if (result == 'unauthorised')
//                    window.location = "/login";
//                else if (result.status == 'error') {
//                    if ($("#url").val() == "/users/") {
//                        window.location = "/users";
//                    }
//                    if ($("#url").val() == "/faqs/") {
//                        window.location = "/faqs";
//                    }
//                    if ($("#url").val() == "/category/") {
//                        window.location = "/category";
//                    }
//                } else {
//                    if ($("#url").val() == "/users/") {
//                        var status = "Active";
//                        $('#name').text(result.data.firstName + " " + result.data.lastName);
//                        $('#email').text(result.data.email || "--");
//                        $('#country_code').text(result.data.country_code || "--");
//                        $('#phone').text(result.data.phone || "--");
//                        if (result.data.status == 3)
//                            status = "Blocked";
//                        $('#status').text(status);
//                        $('#unique_id').text(result.data.unique_id || "--");
//                        var addr = '';
//                        for (var i = 0; i < result.data.customer_address.length; i++) {
//                            addr += '<b>' + result.data.customer_address[i].address_name + '</b>, ' +
//                                    result.data.customer_address[i].unit_number + ', ' +
//                                    result.data.customer_address[i].street_name + ', ' +
//                                    result.data.customer_address[i].sublocation_id.area_name + ', ' +
//                                    result.data.customer_address[i].location_id.name + '<br>'
//                        }
//                        $('#address1').html(addr || "Not Available");
//                    }
//
//                    if ($("#url").val() == "/faqs/") {
//                        $('#question').text(result.data.heading);
//                        $('#answer').text(result.data.description);
//                    }
//                    $('#myModal').modal('show');
//                }
//            }
//        });
//        /***********user ajax view ends here*******/
//    });
//    $(document).on("click", ".disable_user", function () {
//        $('#sub_error_getEmail').text("");
//        $('.error').text("");
//        $('#disableUser-form').trigger("reset");
//        var userId = $(this).attr('userid');
//        var status = $(this).attr('status');
//        $('#disable_user_btn').attr('userid', userId);
//        $('#disable_user_btn').attr('status', status);
//
//        if (status == 1)
//            $('.disable_reason_popup').html('Add your comment why you want to want to mark this user as active?');
//        else
//            $('.disable_reason_popup').html('Add your comment why you want to want to mark this user as inactive?');
//    });
//    //disable user or block bottle drive
//    $(document).on("click", "#disable_user_btn", function () {
//        var url_for_user_disable = "";
//        var disable_reason = $('#disableUserID').val();
//        var userId = $(this).attr('userid');
//        var status = $(this).attr("status");
//        if ($('#disableUser-form').valid()) {
//            if ($("#url").val() == "/users/") {
//                url_for_user_disable = "/users/disable_user";
//            }
//
//            $.ajax({
//                url: url_for_user_disable,
//                type: "POST",
//                data: {userId: userId, disable_reason: disable_reason, status: status},
//                dataType: "JSON",
//                success: function (result) {
//
//                    if (result == 'unauthorised')
//                        window.location = "/login";
//                    else if (result.status == 1) {
//                        $("#sub_error_getEmail").text("");
//                        $('#disableUserModal').modal('hide');
//                        if ($("#url").val() == "/users/") {
//                            if (status == 1) {
//                                $('#disable_user_btn').attr("status", 1);
//                            } else {
//                                $('#disable_user_btn').attr("status", 0);
//                            }
//                            window.location = "/users";
//                        } else if ($("#url").val() == "/bottle_drives/") {
//                            window.location = "/bottle_drives";
//                        } else if ($("#url").val() == "/reported_bottle_drives/") {
//                            window.location = "/reported_bottle_drives";
//                        } else if ($("#url").val() == "/bottle_drive_details/") {
//                            window.location = $("#back_url").val();
//                        }
//                    } else {
//                        $("#sub_error_getEmail").text(result.message);
//                    }
//                }
//            });
//        }
//    });
//    $(document).on("change", "#sort_field", function () {
//        if ($('#sort_field').val()) {
//            $('#sort_type').prop('disabled', false);
//        } else {
//            $('#sort_type').prop('disabled', true);
//        }
//
//        if ($('#sort_field').val() === "status") {
//            var values = [{status: -1, name: "Active"}, {status: 1, name: "Inactive"}];
//        } else {
//            var values = [{status: 1, name: "Ascending"}, {status: -1, name: "Descending"}];
//        }
//        var options = '<option value="">--Select--</option>';
//        for (var i = 0; i < values.length; i++) {
//            options += '<option value="' + values[i].status + '">' + values[i].name + '</option>';
//        }
//        $('#sort_type').html(options);
//    });
//    $(document).on("change", "#state", function () {
//        if ($('#state').val()) {
//
//            $.ajax({
//                url: "/pricing_zone/cities/" + $(this).val(),
//                type: "GET",
//                dataType: "JSON",
//                success: function (result) {
//
//                    if (result == 'unauthorised')
//                        window.location = "/login";
//                    else if (result.status == 1) {
//                        var cities = '<option value="">--Select--</option>';
//                        for (var i = 0; i < result.cities.length; i++) {
//                            cities += '<option value="' + result.cities[i]._id + '">' + result.cities[i].name + '</option>'
//                        }
//                        $('#city').html(cities);
//                    }
//                }
//            });
//            $('#city').prop('disabled', false);
//        } else {
//            $('#city').val("");
//            $('#city').prop('disabled', true);
//        }
//    });

    $(document).on("click", "#start_date, input[name='start_date']", function (e) {
        $("#start_date_picker").datepicker('show').on('changeDate', function (selected) {
            var minDate = new Date(selected.date.valueOf());
            $('#end_date_picker').datepicker('setDate', "");
            $('#end_date_picker').datepicker('setStartDate', minDate);
        });
    });

    $(document).on("click", "#end_date, input[name='end_date']", function (e) {
        $("#end_date_picker").datepicker('show');
    });

    $(document).keydown(function (e) {
        // ESCAPE key pressed
        if (e.keyCode === 27) {
            $('.modal').modal('hide');
        }
    });



    //view user details
    $(document).on("click", ".view-user", function (e) {
        var href = $(this).attr("link");

        $.ajax({
            url: href,
            type: "GET",
            dataType: "JSON",
            success: function (result) {

                if (result == 'unauthorised')
                    window.location = "/login";
                else if (result.status == 1) {


                    let user = $("#user_details_table");
                    if (result.userDetailData.profile_pic == "no-image" || result.userDetailData.profile_pic == null || result.userDetailData.profile_pic == '') {
                        user.find(".profile_pic .single_image").attr("href", "/images/default.png");
                        user.find(".profile_pic .img-circle").attr("src", "/images/default.png");
                    } else {
                        user.find(".profile_pic .single_image").attr("href", result.userDetailData.profile_pic);
                        user.find(".profile_pic .img-circle").attr("src", result.userDetailData.profile_pic);
                        user.find(".profile_pic .img-circle").attr("alt", result.userDetailData.firstName + result.userDetailData.lastName);
                    }

                    user.find(".first_name").text(result.userDetailData.firstName);
                    if (!result.userDetailData.firstName) {
                        result.userDetailData.firstName = "--"
                    }

                    user.find(".last_name").text(result.userDetailData.lastName);
                    if (!result.userDetailData.lastName) {
                        result.userDetailData.lastName = "--"
                    }

                    user.find(".country_code").text(result.userDetailData.country_code);
                    if (!result.userDetailData.country_code) {
                        result.userDetailData.country_code = "--"
                        user.find(".country_code").text("--");
                    }

                    user.find(".phone").text(result.userDetailData.phone);
                    if (!result.userDetailData.phone) {
                        result.userDetailData.phone = "--"
                        user.find(".phone").text("--");
                    }

                    let gender;
                    if (result.userDetailData.gender == 1) {
                        gender = "Male";
                    } else if (result.userDetailData.gender == 2) {
                        gender = "Female";
                    } else if (!result.userDetailData.gender) {
                        gender = "--";
                    } else {
                        gender = "Others";
                    }
                    user.find(".gender").text(gender);
                    if (result.userDetailData.gender == "") {
                        result.userDetailData.gender = "--"
                    }
                    if (!result.userDetailData.email) {
                        result.userDetailData.email = "--"
                    }
                    user.find(".email").text(result.userDetailData.email);
                    /*     if((!result.userDetailData.dob)  || (result.userDetailData.dob == ""){ */
                    if (!result.userDetailData.dob) {
                        user.find(".dob").text("--");
                    } else {
                        let dob = new Date(result.userDetailData.dob);
                        var date_moment = moment(dob).format('DD-MMM-YYYY');
                        //user.find(".dob").text(dob.getDate() + "/" + (dob.getMonth() + 1) + "/" + dob.getFullYear());
                        user.find(".dob").text(date_moment);
                    }
                    if (!result.userDetailData.address) {
                        result.userDetailData.address = "--"
                    }
                    user.find(".location").text(result.userDetailData.address);
                    $("#user-details").modal('show');

                }
            }
        });
    });


    //view reported reviews details
    $(document).on("click", ".view-contact-us", function (e) {
        var href = $(this).attr("link");

        $.ajax({
            url: href,
            type: "GET",
            dataType: "JSON",
            success: function (result) {


                if (result == 'unauthorised')
                    window.location = "/login";
                else if (result.status == 1) {

                    let query = $("#query_details_table");
                    query.find(".username").text(result.query_data.data[0].user.firstName + " " + result.query_data.data[0].user.lastName);
                    query.find(".date_time").text(result.query_data.data[0].created_at);
                    query.find(".subject").text(result.query_data.data[0].contact.name);
                    query.find(".description").text(result.query_data.data[0].message);
                    let id = result.query_data.data[0]._id;

                    if (result.query_data.data[0].status == 0) {
                        let create_resolve_link = ` <div class="resolved"> <a id='my_anchor' linkdata='/contact_us/update/` + id + `'><b>Mark as resolved</b></a>
                        <input type='checkbox' id='checkbox_switch'> </div>`;
                        $("#resolve_container").html(create_resolve_link);
                    }

                    $("#query-details").modal('show');


                }
            }
        });
    })


    //onclick checkbox of contact_us details  href of deleted routed get triggered

    $(document).on("click", "#checkbox_switch", function (e) {

        let href = $("#my_anchor").attr("linkdata");
        $(this).parents('#resolve_container').empty();

        window.location = href;
    })


    //stop enter working on search field
    $("#search_by").keydown(function (event) {
        if (event.keyCode == 13) {
            event.preventDefault();
            return false;
        }
    });


});