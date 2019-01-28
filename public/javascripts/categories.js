function get_category(category_id, institution_id) {
    $.ajax({
        url: "/categories/data",
        type: "POST",
        data: {
            category_id: category_id,
            instution_id: institution_id
        },
        dataType: 'JSON',
        success: function (result) {
            if (result == 'unauthorised') {
                return {status: 0, message: "unauthorised"};
            } else {
                return {status: 1, data: result};
            }
        },
        error: function (xhr) {
            return {status: 0, message: xhr.responseText};
        }
    });
}
jQuery(document).ready(function () {
    $(document).on("click", ".add_more_sub_category", function (event) {
        event.preventDefault();
        console.log("click to add sub category");
    });
    $(document).on("click", ".add_category", function (event) {
        console.log("click to add sub category");
    });
    
});