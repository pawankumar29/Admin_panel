jQuery(document).ready(function () {
    $("input[type=file]").on('change', function (event) {
        if (event.target.files.length > 0) {
            $(".batch-div").show(100);
            $("#batch").attr("required", true);
        } else {
            $(".batch-div").hide(100);
            $("#batch").attr("required", false);
            $("#batch").next("label").remove();
        }
    });

    $('.institute-form').validate({
        focusInvalid: false,
        ignore: [],
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            //            batch: {
            //                required: true
            //            },
            name: {
                required: true,
                minlength: 2,
                maxlength: 100
            },
            po_name: {
                required: true,
                minlength: 3,
                maxlength: 50
            },
            po_email: {
                required: {
                    depends: function () {
                        $(this).val($.trim($(this).val()));
                        return true;
                    }
                },
                maxlength: 50,
                email: true
            },
            resume: {
                required: true
            }
        },
        messages: {
            //            batch: {
            //                required: "Please select Batch.",
            //                minlength: "Please enter 4 characters.",
            //                maxlength: "Please enter 4 characters."
            //            },
            name: {
                required: "Please enter name of Institute.",
                minlength: "Please enter atleast 3 characters.",
                maxlength: "Please enter maximum 100 characters."
            },
            po_name: {
                required: "Please enter T.P.O name.",
                minlength: "Please enter atleast 3 characters.",
                maxlength: "Please enter maximum 50 characters."
            },
            po_email: {
                required: "Please enter T.P.O. email",
                maxlength: "Please enter maximum 50 characters.",
                email: "Please enter a valid email address.",
            },
            resume: {
                required: "Please select resume option"
            }

        },
        errorPlacement: function (error, element) {
            if (element.attr("name") == "po_email") {
                error.insertAfter(element.parent("div"));
            } else {
                error.insertAfter(element)
            }
        }
    });

    let date = new Date();
    let year = parseInt(date.getFullYear() + 5);

    function setEndOfContenteditable(contentEditableElement) {
        var range, selection;
        if (document.createRange) //Firefox, Chrome, Opera, Safari, IE 9+
        {
            range = document.createRange(); //Create a range (a range is a like the selection but invisible)
            range.selectNodeContents(contentEditableElement); //Select the entire contents of the element with the range
            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
            selection = window.getSelection(); //get the selection object (allows you to change selection)
            selection.removeAllRanges(); //remove any selections already made
            selection.addRange(range); //make the range you have just created the visible selection
        } else if (document.selection) //IE 8 and lower
        {
            range = document.body.createTextRange(); //Create a range (a range is a like the selection but invisible)
            range.moveToElementText(contentEditableElement); //Select the entire contents of the element with the range
            range.collapse(false); //collapse the range to the end point. false means collapse to end rather than the start
            range.select(); //Select the range (make it the visible selection
        }
    }
    //javascript code for instruction code
    $(document).on("click", ".add", function () {
        let lastIndex = $("table").find("tr:last").children("td").children("span").text();
        if (parseInt(lastIndex.toString())) {
            lastIndex = parseInt(lastIndex.toString()) + 1;
        } else {
            lastIndex = 1;
        }
        let text = '<tr><td class="col-md-1"><span>' + lastIndex.toString() + '</span></td><td class="col-md-8 addcontent" contenteditable=true></td><td class="col-md-2"><span class="table-remove"><button type="button" class="btn btn-info btn-icon-only create"><i class="fa fa-check"></i></button><button type="button" class="btn btn-warning btn-icon-only  remove"><i class="fa fa-remove"></i></button></span></td></tr>';
        $(this).attr("disabled", true);
        $("table").append(text);
        $(".addcontent").focus();
    });
    $(document).on("click", ".remove", function () {
        $(this).parents("tr").remove();
        $(".add").attr("disabled", false);
    })

    $(document).on("click", ".create", function () {
        let id = $("#institute_id").val();
        let instruction = $(this).parents("td").prev(".addcontent").text();
        $.ajax({
            url: "/instructions",
            type: "POST",
            data: {
                id: id,
                instruction: instruction
            },
            dataType: 'JSON',
            success: function (result) {
                if (result == 'unauthorised') {
                    window.location = "/login";
                } else {
                    $(".dynamic_table").html(result.data);
                    $(".add").attr("disabled", false);
                }
            }
        });
    })

    $('td.content').keydown(function (e) {
        if (e.keyCode === 13) {
            $(this).next("td").children().children("button.save").trigger("click");
        }
    });

    $('td.addcontent').keydown(function (e) {
        if (e.keyCode === 13) {
            $(this).next("td").children().children("button.save").trigger("click");
        }
    });

    $(document).on("click", ".edit", function () {
        let elem = $(this).parents("td").prev();
        elem.attr("contenteditable", 'true').focus();
        setEndOfContenteditable(elem.get(0));
        $(this).removeClass("edit yellow").addClass("save green").html('<i class="fa fa-check"></i>');
    });
    $(document).on("click", ".save", function () {
        let button = $(this);
        let id = $("#institute_id").val();
        let contentElem = button.parents("td").prev(".content");
        let newcontent = contentElem.text();
        let oldcontent = button.parents("td").siblings(':first').children("input").val();
        $.ajax({
            url: "/instructions",
            type: "PUT",
            data: {
                id: id,
                previousInstruction: oldcontent,
                newInstruction: newcontent
            },
            dataType: 'JSON',
            success: function (result) {
                if (result == 'unauthorised') {
                    window.location = "/login";
                } else if (result["status"] == 1) {
                    contentElem.attr("contenteditable", 'false');
                    button.removeClass("save green").addClass("edit yellow").html('<i class="fa fa-edit"></i>');
                    button.parents("td").siblings(':first').children("input").val(newcontent);
                    button.parents("td").prev(".content").text(newcontent);
                }
            }
        });
    });
    $(document).on("click", ".delete", function () {
        let old_instruction = $(this).parents("td").siblings(':first').find("input").val();
        let id = $("#institute_id").val();
        $.ajax({
            url: "/instructions",
            type: "DELETE",
            data: {
                id: id,
                instruction: old_instruction
            },
            dataType: 'JSON',
            success: function (result) {
                if (result == 'unauthorised') {
                    window.location = "/login";
                } else {
                    $(".dynamic_table").html(result.data);
                    $(".add").attr("disabled", false);
                }
            }
        });
    });
    $(document).on("click", ".show_batch_modal", function () {
        var institute_id = $(this).attr('inst_id');
        $('#batch_inst_id').val(institute_id);
        var current_year = new Date().getFullYear();
        var start_year = current_year - 2;
        var html = "";
        for (var year = current_year; year >= start_year; year--) {
            html += "<option>" + year + "</option>"
        }
        $('.batch_year').html(html);
        $('#add_batch_modal').modal('show');
    });
    $('.add_batch_form').validate({
        focusInvalid: false,
        ignore: [],
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            batch: {
                required: true
            },
            date: {
                required: true,
                date: true
            }
        },
        messages: {
            batch: {
                required: "Please select Batch."
            },
            data: {
                required: "Please select date",
                date: "Please select valid date"
            }
        }
    });
    $('.enable_quiz_form').validate({
        focusInvalid: false,
        ignore: [],
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            duration: {
                required: true,
                number: true
            },
        },
        messages: {
            duration: {
                required: "Please select duration.",
                number: "Enter digits only."
            },

        }
    });

    $(document).on("click", ".enable_test", function (event) {
        event.preventDefault();
        if ($(".enable_quiz_form").valid()) {
            var duration = $("#test_duration").val();
            var time = $("#test_time").val();
            var date = $("#date_test").val();
            var batch = $(".batch_year").children("option:selected").val()
            var chips = [];
            $(".chipcontainer").children(".chip").each(function () {
                chips.push($(this).data("value"));
            });
            var data = {
                duration: duration,
                time: time,
                date: date,
                batch: batch,
                institute: chips
            };
            console.log("data");
            console.log(data);
            $.ajax({
                url: "/institutes/enable_test",
                type: "POST",
                data: data,
                dataType: 'JSON',
                success: function (result) {
                    console.log(result);
                    window.location = "/institutes"
                }
            });
        }
    });
});