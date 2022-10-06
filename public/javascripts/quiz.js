jQuery(document).ready(function () {
    
    $('.org-category-form').validate({
        focusInvalid: false,
        onkeyup: false,
        invalidHandler: function (form, validator) {
            var errors = validator.numberOfInvalids();
            if (errors) {
                validator.errorList[0].element.focus();
            }
        },
        rules: {
            name: {
                required: true,
            },
            sub_category: {
                required: true,
            }
        },
        messages: {
            name: {
                required: "Please enter category name."
            },
            sub_category: {
                required: "Please enter sub category name."
            }
        }
    });
    $('input[type=radio][name="category_type"]').on('change', function (e) {
        if ($(this).val() == 1) {
            $('.sub_category_div').css("display", "block");
//            $('.number_of_question_div').css("display", "none");
        } else {
//            $('.number_of_question_div').css("display", "block");
            $('.sub_category_div').css("display", "none");
        }


    });
    $(document).on("click", ".add_quiz_sub_category", function (event) {
        let buttonClick = $(this);
        event.preventDefault();
        var html = "<div class='row sub_cat_row'><div class='col-md-4'><label class='control-label'><b>Sub Category Name:</b></label></div><div class='col-md-4'><input class='form-control placeholder-no-fix' type='text' placeholder='Sub Category Name' name='sub_category'></div><div class='col-md-3'><a class='remove_sub_cat_row btn btn-circle btn-icon-only btn-default'><i class='fa fa-times' style='color:red'></i></a></div></div>"
        $('.sub_category').append(html);
    });
    $(document).on("click", ".remove_sub_cat_row", function (event) {
        $(this).parents('.sub_cat_row').css('display', 'none');
    });

});