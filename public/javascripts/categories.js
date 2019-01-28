function get_category(category_id, institution_id) {
    $.ajax({
        url: "/categories",
        type: "POST",
        data: {
            category_id: category_id,
            instution_id: institution_id
        },
        dataType: 'JSON',
        success: function(result) {
            if (result == 'unauthorised') {
                return {
                    status: 0,
                    message: "unauthorised"
                };
            } else {
                return {
                    status: 1,
                    data: result
                };
            }
        },
        error: function(xhr) {
            return {
                status: 0,
                message: xhr.responseText
            };
        }
    });
}
jQuery(document).ready(function() {
    $(document).on("click", ".add_more_sub_category", function(event) {
        event.preventDefault();
        let institute_id = $("#institute_id").val();
        let category_id = $(this).parents(".form-group").prev().find("select").children("option:selected").val();
        console.log("institute id");
        console.log(institute_id);
        console.log("category_id");
        console.log(category_id);
        get_category(category_id.toString(), institute_id.toString());
    });
    $(document).on("click", ".add_category", function(event) {
        console.log("click to add sub category");
    });

});