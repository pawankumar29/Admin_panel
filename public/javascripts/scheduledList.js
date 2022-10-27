var TableManaged = function() {

    var initTable1 = function() {

        var table = $('#datatable');

        // begin first table
        table.dataTable({
            "fnRowCallback": function(nRow, aData, iDisplayIndex) {
                var page = this.fnPagingInfo().iPage;
                var length = this.fnPagingInfo().iLength;
                $("td:first", nRow).html(page * length + (iDisplayIndex + 1));
                showDetails();
                // $("td:first", nRow).html(iDisplayIndex + 1);
                console.log(nRow,"====================")
                return nRow;
            },
            "infoCallback": function(settings, start, end, max, total, pre) {
                return "Showing " + start + " to " + end + " of " + total + " records";
            },
            // Internationalisation. For more info refer to http://datatables.net/manual/i18n
            "language": {
                "aria": {
                    "sortAscending": ": activate to sort column ascending",
                    "sortDescending": ": activate to sort column descending"
                },
                "emptyTable": "No data available in table",
                "info": "Showing _START_ to _END_ of _TOTAL_ entries",
                "infoEmpty": "No entries found",
                "infoFiltered": "(filtered1 from _MAX_ total entries)",
                "lengthMenu": "Show _MENU_ entries",
                "search": "Search:",
                "zeroRecords": "No matching records found"
            },

            // Or you can use remote translation file
            //"language": {
            //   url: '//cdn.datatables.net/plug-ins/3cfcc339e89/i18n/Portuguese.json'
            //},

            // Uncomment below line("dom" parameter) to fix the dropdown overflow issue in the datatable cells. The default datatable layout
            // setup uses scrollable div(table-scrollable) with overflow:auto to enable vertical scroll(see: assets/global/plugins/datatables/plugins/bootstrap/dataTables.bootstrap.js). 
            // So when dropdowns used the scrollable div should be removed. 
            //"dom": "<'row'<'col-md-6 col-sm-12'l><'col-md-6 col-sm-12'f>r>t<'row'<'col-md-5 col-sm-12'i><'col-md-7 col-sm-12'p>>",

            "bStateSave": true, // save datatable state(pagination, sort, etc) in cookie.

            "columns": [{
                "orderable": false
            }, {
                "orderable": true
            }, {
                "orderable": true
            }, {
                "orderable": false
            }, {
                "orderable": false
            }, {
                "orderable": false
            }],
            "lengthMenu": [
                [5, 15, 20, -1],
                [5, 15, 20, "All"] // change per page values here
            ],
            // set the initial value
            "pageLength": 5,
            "pagingType": "bootstrap_full_number",
            "language": {
                "search": "My search: ",
                "lengthMenu": "  _MENU_ records",
                "paginate": {
                    "previous": "Prev",
                    "next": "Next",
                    "last": "Last",
                    "first": "First"
                }
            },
            "columnDefs": [{ // set default column settings
                'orderable': false,
                'targets': [0]
            }, {
                "searchable": false,
                "targets": [0]
            }],
            "order": [
                    [2, "desc"]
                ] // set first column as a default sort by asc
        });

        var tableWrapper = jQuery('#sample_1_wrapper');
        table.find('.group-checkable').change(function() {
            var set = jQuery(this).attr("data-set");
            var checked = jQuery(this).is(":checked");
            jQuery(set).each(function() {
                if (checked) {
                    $(this).attr("checked", true);
                    $(this).parents('tr').addClass("active");
                } else {
                    $(this).attr("checked", false);
                    $(this).parents('tr').removeClass("active");
                }
            });
            jQuery.uniform.update(set);
        });

        table.on('change', 'tbody tr .checkboxes', function() {
            $(this).parents('tr').toggleClass("active");
        });

        tableWrapper.find('.dataTables_length select').addClass("form-control input-xsmall input-inline"); // modify table per page dropdown
    }

    return {

        //main function to initiate the module
        init: function() {
            if (!jQuery().dataTable) {
                return;
            }

            initTable1();
        }

    };

}();
function showDetails() {
    $(".editQuiz").on('click', function (e) {
    console.log("edittttttttttttttttttt");
    e.preventDefault();
    let url = $(this).attr("link");
    console.log(url, "llllllllll");
    let quiz_id = $(this).attr("quiz_id");
    $.ajax({
      url: url,
      type: "GET",
      success: function (result) {
        if (result == "unauthorised") {
          window.location = "/login";
        } else {
          // var dt = new Date(result.data.start_time);
          // dt.setDate(dt.getDate() + 1);
          ComponentsPickers.init();
          $(".date")
            .datepicker({
              autoclose: true,
              format: "mm/dd/yyyy",
              startDate: new Date(),
            })
            .on("changeDate", function (e) {
              $(".date").attr("data-value", e.dates);
              $(".date-error").html("");
            });
          $(".date").datepicker("setDate", new Date(result.data.start_time));
          var current_year = new Date().getFullYear();
          var start_year = current_year - 2;
          var html = "";
          for (var year = current_year; year >= start_year; year--) {
            html += "<option value = '" + year + "'>" + year + "</option>";
          }
          $(".batch_year").html(html);
          $("#batch_year_test").html(html);
          let H = new Date(result.data.start_time).getHours();
          let M = new Date(result.data.start_time).getMinutes();
          if (M < 10) M = "0" + M;
          $("#test_time").val(H + ":" + M);
          $("#quiz_id").val(quiz_id);
          $("#test_duration").val(result.data.duration);
          $("#batch_year").val(result.data.batch_year);
          $("#edit_test_modal").modal("show");
        }
      },
    });
  });
  }