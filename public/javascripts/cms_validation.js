jQuery(document).ready(function () {
    $.validator.addMethod('content_max', function (value, element, param) {
        var dom = document.createElement("DIV");
        dom.innerHTML = value;
        var plain_text = (dom.textContent || dom.innerText);
        if (plain_text.length > param) {
            return false;
        } else
            return true;
    }, "Content maximum langth is reached.");

    $('.cmstemplate-form').validate({
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
            heading: {
                required: true,
                maxlength: 200
            },
            cms_description: {
                required: function ()
                {
                    CKEDITOR.instances.cms_description.updateElement();
                },
                content_max: 20000
            }
        },
        messages: {
            name: {
                required: "Enter name.",
                maxlength: "Name maximum length is 100."
            },
            heading: {
                required: "Enter title.",
                maxlength: "Title maximum length is 200."
            },
            cms_description: {
                required: "Enter content.",
                content_max: "Content maximum langth is 20000."
            }
        }
    });
});
