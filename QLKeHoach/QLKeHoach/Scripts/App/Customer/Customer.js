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
GPRO.namespace('Customer');
GPRO.Customer = function () {
    var Global = {
        UrlAction: {
            Gets: 'Customer/Gets',
            Save: '/Customer/Save',
            Delete: '/Customer/Delete'
        },
        Data: {
            Customers: [],
            selectedCustomer: null,
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
        if (confirm('Những dữ liệu liên quan đến khách hàng này sẽ bị xóa. Bạn có muốn xóa khách hàng này ?'))
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
           // data: JSON.stringify({ 'FloorId': 2, 'IsAll': 1 }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (objs) {
                $('.progress').addClass('hide');
                if (Global.Data.table != null) {
                    Global.Data.table.destroy();
                    $('#tbCustomers').empty();
                    Global.Data.table = null;
                }
                Global.Data.Customers = null;
                Global.Data.Customers = objs;
                DrawTable(objs);
                ReDrawFilterAndLengthBoxForGrid(Global.Data.table);
                $('.table-responsive').show();
            }
        });
    }

    function DrawTable(objs) {
        Global.Data.table = $("#tbCustomers").DataTable({
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
                        "targets": [4], 
                        "orderable": false  
                    },
                    {
                        "targets": [5],
                        "visible": true,
                        "searchable": false,
                        "orderable": false,
                        className: "action-box"
                    }],

            "columns": [
                { "data": "Code", "title": "Mã khách hàng" },
                { "data": "Name", "title": "Tên khách hàng" },
                { "data": "Phone", "title": "Số điện thoại" },
                { "data": "OwnerName", "title": "Người đại diện" }, 
                { "data": "Address", "title": "Địa chỉ" },
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
        btnAdd.insertBefore('#tbCustomers_filter');
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
        var Customer = $.map(Global.Data.Customers, function (item, i) {
            if (item.MaSanPham == Id)
                return item;
        })[0];
        Global.Data.selectedCustomer = Customer;
        Global.Data.Id = Customer.Id;
        $('#txtname').val(Customer.Name);
        $('#txtcode').val(Customer.Code);
        $('#txtPhone').val(Customer.Phone); 
        $('#txtOwner').val(Customer.OwnerName);
        $('#txtAddress').val(Customer.Address); 
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
                    Code: $('#txtcode').val(),
                    Phone: $('#txtPhone').val(), 
                    Address: $('#txtAddress').val(),
                    OwnerName: $('#txtOwner').val() 
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
            $('#txtcode').val(1);
            $('#txtPhone').val(1);
            $('#txtAddress').val('');
            $('#txtTGCT').val(1);
             $('#txtOwner').val('');
             $('#txtDGC').val(1);
            Global.Data.Id = 0;
            Global.Data.selectedCustomer = null;
            $("#" + Global.Element.popupId).modal("close");
        });
    }

    function CheckValidate() {
        if ($('#txtname').val().trim() == "") {
            alert("Nhập tên khách hàng.");
            $('#txtname').focus();
            return false;
        }
        else if ($('#txtcode').val().trim() == "") {
            alert("Nhập mã khách hàng.");
            $('#txtcode').focus();
            return false;
        } 
        else if ($('#txtPhone').val().trim() == "") {
            alert("Nhập số điện thoại.");
            $('#txtPhone').focus();
            return false;
        }  
        else if ($('#txtOwner').val().trim() == "") {
            alert("Nhập tên người đại diện.");
            $('#txtOwner').focus();
            return false;
        }  
        return true;
    }
}
