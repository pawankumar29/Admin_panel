jQuery(document).ready(function () {
    $.validator.addMethod('content_max', function (value, element, param) {
        var dom = document.createElement("DIV");
        dom.innerHTML = value;
        var plain_text = (dom.textContent || dom.innerText);
        if (plain_text.length > param) {
            return false;
        } else
            return true;
    }, "Answer maximum langth is reached.");
    $.validator.addMethod('content_min', function (value, element, param) {
        var dom = document.createElement("DIV");
        dom.innerHTML = value;
        var plain_text = (dom.textContent || dom.innerText);
        if (plain_text.length < param) {
            return false;
        } else
            return true;
    }, "Answer minimum langth is reached.");

    $('.faq-form').validate({
        focusInvalid: false,
        ignore: [],
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            heading: {
                required: true,
                minlength: 10,
                maxlength: 250
            },
            faq_description: {
                required: function ()
                {
                    CKEDITOR.instances.faq_description.updateElement();
                },
                content_min: 10,
                content_max: 1000
            }
        },
        messages: {
            heading: {
                required: "Enter question.",
                minlength: "Please enter at least 10 characters.",
                maxlength: "Question maximum length is 250."
            },
            faq_description: {
                required: "Enter answer.",
                content_min: "Answer maximum langth is 10.",
                content_max: "Answer maximum langth is 1000."
            }
        }
    });
});
