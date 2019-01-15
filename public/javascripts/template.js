//admin template.js

jQuery(document).ready(function () {

    $("#addMore").click(function () {
        $('<p> <input class="form-control" type="text" name="variables" value="" placeholder="input variable" /> <a href="#" id="remScnt">Remove</a></p>').appendTo($('#add_input'));
    });

    $(document).on('click', '#remScnt', function () {
        $(this).parents("p").remove();
    });

    $.validator.addMethod('content_max', function (value, element, param) {
        var dom = document.createElement("DIV");
        dom.innerHTML = value;
        var plain_text = (dom.textContent || dom.innerText);
        if (plain_text.length > param) {
            return false;
        } else
            return true;
    }, "Content maximum langth is reached.");

    $('.template-form').validate({
        focusInvalid: false,
        ignore: [],
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            name: {
                required: true,
                maxlength: 100
            },
            subject: {
                required: true,
                maxlength: 200
            },
            variables: {
                required: true
            },
            content: {
                required: function ()
                {
                    CKEDITOR.instances.content.updateElement();
                },
                content_max: 2000
            }
        },
        messages: {
            name: {
                required: "Enter name.",
                maxlength: "Name maximum length is 100."
            },
            subject: {
                required: "Enter subject.",
                maxlength: "Subject maximum length is 200."
            },
            variables: {
                required: "Enter keywords."
            },
            content: {
                required: "Enter content.",
                content_max: "Content maximum langth is 2000."
            }
        }
    });
});
