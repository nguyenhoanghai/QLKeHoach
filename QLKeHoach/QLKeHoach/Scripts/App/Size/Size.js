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
GPRO.namespace('_Size');
GPRO.Size = function () {
    var Global = {
        UrlAction: {
            Gets: '/Size/Gets',
            Save: '/Size/Save',
            Delete: '/Size/Delete'
        },
        Data: {
            Sizes: [],
            selectedSize: null,
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
        if (confirm('Những dữ liệu liên quan đến Size này sẽ bị xóa. Bạn có muốn xóa Size này ?'))
            Delete(Id);
    }

    this.Init = function () {
        RegisterEvent();
        InitPopup();
        Gets();
    }


    var RegisterEvent = function () {

    }

    function Gets() {
        $.ajax({
            url: Global.UrlAction.Gets,
            type: 'POST', 
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (objs) {
                $('.progress').addClass('hide');
                if (Global.Data.table != null) {
                    Global.Data.table.destroy();
                    $('#tbSizes').empty();
                    Global.Data.table = null;
                }
                Global.Data.Sizes = null;
                Global.Data.Sizes = objs;
                DrawTable(objs);
                ReDrawFilterAndLengthBoxForGrid(Global.Data.table);
                $('.table-responsive').show();
            }
        });
    }

    function DrawTable(objs) {
        Global.Data.table = $("#tbSizes").DataTable({
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
                [
                    {
                        "targets": [1],
                        "orderable": false,
                    },
                    {
                        "targets": [2],
                        "visible": true,
                        "searchable": false,
                        "orderable": false,
                        className: "action-box"
                    }],

            "columns": [
                { "data": "Name", "title": "Tên Size" },
                { "data": "Note", "title": "Ghi chú" },
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
        btnAdd.insertBefore('#tbSizes_filter');
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
        var Size = $.map(Global.Data.Sizes, function (item, i) {
            if (item.Id == Id)
                return item;
        })[0];
        Global.Data.selectedSize = Size;
        Global.Data.Id = Size.Id;
        $('#txtname').val(Size.Name);
        $('#txtNote').val(Size.Note);
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
            Global.Data.selectedSize = null;
            $("#" + Global.Element.popupId).modal("close");
        });
    }

    function CheckValidate() {
        if ($('#txtname').val().trim() == "") {
            alert("Nhập tên Size.");
            $('#txtname').focus();
            return false;
        }
        return true;
    }
}
