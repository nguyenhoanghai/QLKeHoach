if (typeof GPRO == 'undefined' || !GPRO) {
    var GPRO = {};
}

GPRO.namespace = function () {
    var a = arguments,
        o = null,
        i, j, d;
    for (i = 0; i < a.length; i = i + 1) {
        d = ('' + a[i]).split('.');
        o = GPRO;
        for (j = (d[0] == 'GPRO') ? 1 : 0; j < d.length; j = j + 1) {
            o[d[j]] = o[d[j]] || {};
            o = o[d[j]];
        }
    }
    return o;
}
GPRO.namespace('Assignment');
GPRO.Assignment = function () {
    var Global = {
        UrlAction: {
            Gets: '/Assignment/Gets',
            Save: '/Assignment/Save',
            Delete: '/Assignment/Delete'
        },
        Data: {
            Assignments: [],
            selectedAssignment: null,
            table: null,
            Id: 0
        },
        Element: {
            popupId: 'modal1'
        }
    }

    this.GetGlobal = function () {
        return Global;
    }

    this.Edit = function (Id) {
        Edit(Id);
    }

    this.Delete = function (Id) {
        if (confirm('Những dữ liệu liên quan đến Assignment này sẽ bị xóa. Bạn có muốn xóa Assignment này ?'))
            Delete(Id);
    }

    this.Init = function () {
        RegisterEvent();
        //InitPopup();
        GetLines('line-select');
    }


    var RegisterEvent = function () {
        $('#line-select').change(() => {
            Gets();
        })
    }

    function Gets() {
        $.ajax({
            url: Global.UrlAction.Gets,
            type: 'POST',
            data: JSON.stringify({ 'LineId': $('#line-select').val() }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (objs) {
                $('.progress').addClass('hide');
                if (Global.Data.table != null) {
                    Global.Data.table.destroy();
                    $('#tbAssignments').empty();
                    Global.Data.table = null;
                }
                Global.Data.Assignments = null;
                Global.Data.Assignments = objs;
                DrawTable(objs);
                ReDrawFilterAndLengthBoxForGrid(Global.Data.table);
                $('.table-responsive').show();
            }
        });
    }

    function DrawTable(objs) {
        Global.Data.table = $("#tbAssignments").DataTable({
            "filter": true, // this is for disable filter (search box)
            "orderMulti": false, // for disable multiple column at once
            "lengthMenu": [[10, 25, 50, -1], [10, 25, 50, "All"]],
            "pageLength": 25,
            "data": objs,
            "responsive": true,
            "oLanguage": {
                "sSearch": "Bộ lọc"
            },
            "columnDefs":
                [                     {
                        "targets": [10],
                        "visible": true,
                        "searchable": false,
                        "orderable": false,
                        className: "action-box"
                    }],

            "columns": [
                { "data": "STT_TH", "title": "TT Sản xuất" },
                { "data": "CommoName", "title": "Mã hàng" },
                { "data": "ProductionPlans", "title": "SL kế hoạch" },
                { "data": "ColorName", "title": "Màu" },
                { "data": "SizeName", "title": "Size" },
                { "data": "LK_TH", "title": "LK thực hiện" },
                {
                    "data": "DateInput", "title": "Ngày vào chuyền",
                    render: function (data, type, full, meta) {
                        if (data != null)
                            return '<span>' + moment(data).format('DD/MM/YYYY') + '</span>';
                        else
                            return '';
                    }
                },
                {
                    "data": "DateOutput", "title": "Ngày nhập kho",
                    render: function (data, type, full, meta) {
                        if (data != null)
                            return '<span>' + moment(data).format('DD/MM/YYYY') + '</span>';
                        else
                            return '';
                    }
                },
                {
                    "data": "IsFinishStr", "title": "TT xưởng may",
                    render: function (data, type, full, meta) {
                        return '<span class="' + (data == "kết thúc" ? "red-text" : "") + '">' + data + '</span>';
                    }
                },
                {
                    "data": "IsStopForeverStr", "title": "TT xưởng HT",
                    render: function (data, type, full, meta) {
                        return '<span class="' + (data == "kết thúc" ? "red-text" : "") + '">' + data + '</span>';
                    }
                },
                {
                    "render": function (data, type, full, meta) {
                        return `<i class="material-icons icon-edit  cursor" onClick="Edit(${full.Id})">edit</i> 
                    <i class="material-icons cursor  icon-delete " onClick="Delete(${full.Id})">delete</i>`;
                    }
                }]
        });

        var btnAdd = $('<button class="btn-floating btn-small waves-effect waves-light red" style="margin: 25px 0  0  15px; float:right"><i class="material-icons">add</i></button>');
        btnAdd.click(function () {
            $('#' + Global.Element.popupId).modal()[0].M_Modal.options.dismissible = false;
            $('#' + Global.Element.popupId).modal('open');
            M.updateTextFields();
        });
        btnAdd.insertBefore('#tbAssignments_filter');
    }

    function Delete(Id) {
        $.ajax({
            url: Global.UrlAction.Delete,
            type: 'POST',
            data: JSON.stringify({ 'Id': Id }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (objs) {
                $('.progress').addClass('hide');
                Gets();
            }
        });
    }

    function Edit(Id) {
        var Assignment = $.map(Global.Data.Assignments, function (item, i) {
            if (item.Id == Id)
                return item;
        })[0];
        Global.Data.selectedAssignment = Assignment;
        Global.Data.Id = Assignment.Id;
        $('#txtname').val(Assignment.Name);
        $('#txtNote').val(Assignment.Note);
        $('#' + Global.Element.popupId).modal()[0].M_Modal.options.dismissible = false;
        $('#' + Global.Element.popupId).modal('open');
        M.updateTextFields();
    }

    function InitPopup() {
        $("#modal1").modal({
            dismissible: false
        });

        $('#modal1 #btnSave').click(function () {
            if (CheckValidate()) {
                var obj = {
                    Id: Global.Data.Id,
                    Name: $('#txtname').val(),
                    Note: $('#txtNote').val()
                }
                $.ajax({
                    url: Global.UrlAction.Save,
                    type: 'POST',
                    data: JSON.stringify(obj),
                    contentType: 'application/json charset=utf-8',
                    beforeSend: function () { $('.progress').removeClass('hide'); },
                    success: function (response) {
                        $('.progress').addClass('hide');
                        if (response.IsSuccess) {
                            $('#modal1 #btnCancel').click();
                            Gets();
                        }
                        else
                            alert(response.Messages[0].msg);
                    }
                });
            }
        });

        $('#modal1 #btnCancel').click(function () {
            $('#txtname').val('');
            $('#txtNote').val('');
            Global.Data.Id = 0;
            Global.Data.selectedAssignment = null;
            $("#" + Global.Element.popupId).modal("close");
        });
    }

    function CheckValidate() {
        if ($('#txtname').val().trim() == "") {
            alert("Nhập tên Assignment.");
            $('#txtname').focus();
            return false;
        }
        return true;
    }
}
