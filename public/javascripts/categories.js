function get_category(category_id, institution_id) {
    let data = {};
}
jQuery(document).ready(function () {
    $(document).on("click", ".add_more_sub_category", function (event) {
        let buttonClick = $(this);
        event.preventDefault();
        let institute_id = $("#institute_id").val();
        let category_id = buttonClick.parents(".form-group").prev().find("select").children("option:selected").val();
        $.ajax({
            url: "/categories",
            type: "POST",
            data: {
                category_id: category_id,
                instution_id: institute_id
            },
            dataType: 'JSON',
            success: function (result) {
                //                console.log(result);
                if (result == 'unauthorised') {
                    return {
                        status: 0,
                        message: "unauthorised"
                    };
                } else {
                    var text = "";
                    if (result.data.sub_category.length > 0) {
                        text = '<div class="row sub-category-row"><div class="col-md-4"><select class="bs-select form-control sub_category" data-placeholder="Select category type" name="sub_category[' + category_id.toString() + ']"><option value="" disabled selected hidden>Select ...</option>'
                        for (let i = 0; i < result.data.sub_category.length; i++) {
                            text = text + '<option value="' + result.data.sub_category[i]["_id"] + '">' + result.data.sub_category[i]["name"] + '</option>';
                        }
                        text = text + '</select></div><div class="col-md-7"><div class="col-md-6"><label class="control-label"><b>Number of Questions:</b></label></div><div class="col-md-6"><input class="form-control placeholder-no-fix" value="0" type="text" placeholder="Number" name="sub_category_number[' + category_id + '] maxlength="3"></div></div></div>'
                        buttonClick.parents(".form-group").find(".sub_category_container").append(text);
                    }
                }
            },
            error: function (xhr) {
                return {
                    status: 0,
                    message: xhr.responseText
                };
            }
        });
    });
    $(document).on("click", ".add_category", function (event) {
        console.log("click to add category");
        let button = $(this);
        let text = "";
        let institute_id = $("#institute_id").val();
        $.ajax({
            url: "/categories/list?i=" + institute_id,
            type: "GET",
            dataType: 'JSON',
            success: function (result) {
                if (result == 'unauthorised') {
                    return {
                        status: 0,
                        message: "unauthorised"
                    };
                } else {
                    text = '<form class="category_form" action=""><div class="form-body"><div class="form-group"><div class="row"><div class="col-md-3"><label class="control-label"><b>Select Category Type:</b></label></div><div class="col-md-6"><select class="bs-select form-control category" data-placeholder="Select category type" name="category"><option value="" disabled selected hidden>Select category type:</option>'
                    for (let i = 0; i < result.data.length; i++) {
                        text = text + '<option value="' + result.data[i]["_id"] + '">' + result.data[i]["name"] + '</option>';
                    }
                    text = text + '</select></div><button type="button" class="btn btn-labeled btn-danger delete-category"><span class="btn-label"><i class="glyphicon glyphicon-trash"></i></span></button></div></div><div class="form-group"></div></div></form>';
                    button.parents(".portlet-body").find(".form-container").append(text);
                }
            },
            error: function (xhr) {
                console.log(xhr.responseText);
                return {
                    status: 0,
                    message: xhr.responseText
                };
            }
        });
    });

    $(document).on("change", ".category", function (e) {
        let event = $(this);
        let category_id = $(this).find('option:selected').val();
        $.ajax({
            url: "/categories",
            type: "POST",
            data: {
                category_id: category_id,
            },
            dataType: 'JSON',
            success: function (result) {
                console.log(result);
                if (result == 'unauthorised') {
                    return {
                        status: 0,
                        message: "unauthorised"
                    };
                } else {
                    var text = "";
                    if (result.data.sub_category.length > 0) {
                        text = '<div class="row"><div class="col-md-3"><label class="control-label"><b>Sub Category Name:</b></label></div><div class="col-md-8"><div class="sub_category_container"><div class="row sub-category-row"><div class="col-md-4"><select class="bs-select form-control sub_category" name="sub_category[' + category_id.toString() + ']"><option value="" disabled selected hidden>Select ...</option>'
                        for (let i = 0; i < result.data.sub_category.length; i++) {
                            text = text + '<option value="' + result.data.sub_category[i]["_id"] + '">' + result.data.sub_category[i]["name"] + '</option>';
                        }
                        text = text + '</select></div><div class="col-md-7"><div class="col-md-6"><label class="control-label"><b>Number of Questions:</b></label></div><div class="col-md-6"><input class="form-control placeholder-no-fix" value="0" type="text" placeholder="Number" name="sub_category_number[' + category_id.toString() + ']" maxlength="3"></div></div></div></div><div class="row"><div class="col-md-7"></div><div class="col-md-4"><button class="btn btn-success add_more_sub_category"><i class="glyphicon glyphicon-plus"></i> Add More</button></div></div><div></div>'

                    } else {
                        text = '<div class="row"><div class="col-md-3"></div><div class="col-md-8 category-number-label"><div class="col-md-4"><label class="control-label"><b>Number of Questions:</b></label></div><div class="col-md-4"><input class="form-control placeholder-no-fix" value="0" type="text" placeholder="Number" name="category_number[' + category_id.toString() + ']" maxlength="3"></div></div></div>'
                    }
                    event.parents(".form-group").next().html(text);

                }
            },
            error: function (xhr) {
                return {
                    status: 0,
                    message: xhr.responseText
                };
            }
        });
    })

    $(document).on("change", ".sub_category", function (e) {
        console.log("sub category change");
        let category_id = $(this).parents(".form-group").prev().find("select").children("option:selected").val();
        console.log("cateagory id");
        console.log(category_id);
        let sub_category_id = $(this).find('option:selected').val();
        console.log($(this).parent().next().find("input").attr("name"));


    });
    $(document).on("click", ".delete-category", function () {
        console.log($(this).parents("form"));
        $(this).parents("form").remove();

    });
    $(document).on("click", "#save-category-btn", function (e) {
        var data = $("form").serializeArray();
        data = JSON.parse(JSON.stringify(data));
        data.push({ name: "instituteId", value: $("#institute_id").val() });
        $.ajax({
            url: "/categories",
            type: "PUT",
            data: data,
            dataType: 'JSON',
            success: function (result) {
                console.log(result);
                 window.location.reload();
            },
            error: function (xhr) {
                console.log(xhr);
                window.location = "/institutes";
            }
        });
    })
});