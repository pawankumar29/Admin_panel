jQuery(document).ready(function () {
    $("input[type=file]").on('change', function (event) {
        if (event.target.files.length > 0) {
            $("#batch").attr("required", true);
        } else {
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
                required: "Please enter P.O name.",
                minlength: "Please enter atleast 3 characters.",
                maxlength: "Please enter maximum 50 characters."
            },
            po_email: {
                required: "Please enter P.O. email",
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
});