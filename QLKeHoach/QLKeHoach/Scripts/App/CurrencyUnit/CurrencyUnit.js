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
GPRO.namespace('CurrencyUnit');
GPRO.CurrencyUnit = function () {
    var Global = {
        UrlAction: {
            Gets: '/CurrencyUnit/Gets',
            Save: '/CurrencyUnit/Save',
            Delete: '/CurrencyUnit/Delete'
        },
        Data: {
            CurrencyUnits: [],
            selectedCurrencyUnit: null,
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
        if (confirm('Những dữ liệu liên quan đến đơn vị tiền tệ này sẽ bị xóa. Bạn có muốn xóa đơn vị tiền tệ này ?'))
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
                    $('#tbCurrencyUnits').empty();
                    Global.Data.table = null;
                }
                Global.Data.CurrencyUnits = null;
                Global.Data.CurrencyUnits = objs;
                DrawTable(objs);
                ReDrawFilterAndLengthBoxForGrid(Global.Data.table);
                $('.table-responsive').show();
            }
        });
    }

    function DrawTable(objs) {
        Global.Data.table = $("#tbCurrencyUnits").DataTable({
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
                        "targets": [0],  
                        width:'150px'
                    },
                    {
                        "targets": [1],
                        "orderable": false 
                    },
                    {
                        "targets": [2],
                        "visible": true,
                        "searchable": false,
                        "orderable": false,
                        className: "action-box"
                    }],

            "columns": [
                { "data": "Code", "title": "Mã đơn vị tiền tệ" }, 
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
        btnAdd.insertBefore('#tbCurrencyUnits_filter');
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
        var CurrencyUnit = $.map(Global.Data.CurrencyUnits, function (item, i) {
            if (item.Id == Id)
                return item;
        })[0];
        Global.Data.selectedCurrencyUnit = CurrencyUnit;
        Global.Data.Id = CurrencyUnit.Id;
        $('#txtcode').val(CurrencyUnit.Code); 
        $('#txtNote').val(CurrencyUnit.Note); 
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
                    Code: $('#txtcode').val(), 
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
            $('#txtcode').val(''); 
            $('#txtNote').val(''); 
            Global.Data.Id = 0;
            Global.Data.selectedCurrencyUnit = null;
            $("#" + Global.Element.popupId).modal("close");
        });
    }

    function CheckValidate() {
        if ($('#txtcode').val().trim() == "") {
            alert("Nhập mã đơn vị tiền tệ.");
            $('#txtcode').focus();
            return false;
        } 
        return true;
    }
}
