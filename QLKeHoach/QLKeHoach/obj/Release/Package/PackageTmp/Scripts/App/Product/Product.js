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
GPRO.namespace('Product');
GPRO.Product = function () {
    var Global = {
        UrlAction: {
            Gets: '/Product/Gets',
            Save: '/Product/Save',
            Delete: '/Product/Delete'
        },
        Data: {
            products: [],
            selectedProduct: null,
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
        if (confirm('Những dữ liệu liên quan đến sản phẩm này sẽ bị xóa. Bạn có muốn xóa sản phẩm này ?'))
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
            data: JSON.stringify({ 'FloorId': 2, 'IsAll': 1 }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (objs) {
                $('.progress').addClass('hide');
                if (Global.Data.table != null) {
                    Global.Data.table.destroy();
                    $('#tbProducts').empty();
                    Global.Data.table = null;
                }
                Global.Data.products = null;
                Global.Data.products = objs;
                DrawTable(objs);
                ReDrawFilterAndLengthBoxForGrid(Global.Data.table);
                $('.table-responsive').show();
            }
        });
    }

    function DrawTable(objs) {
        Global.Data.table = $("#tbProducts").DataTable({
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
                        "targets": [6], 
                        "orderable": false  
                    },
                    {
                        "targets": [7],
                        "visible": true,
                        "searchable": false,
                        "orderable": false,
                        className: "action-box"
                    }],

            "columns": [
                { "data": "TenSanPham", "title": "Tên sản phẩm" },
                { "data": "DonGia", "title": "Đơn giá " },
                { "data": "DonGiaCM", "title": "Đơn giá CM" },
                { "data": "DonGiaCat", "title": "Đơn giá cắt" },
                { "data": "ProductionTime", "title": "TG chế tạo" },
                { "data": "MaKhachHang", "title": "Mã khách hàng" },
                { "data": "DinhNghia", "title": "Ghi chú" },
                {
                    "render": function (data, type, full, meta) {
                        return `<i class="material-icons icon-edit  cursor" onClick="Edit(${full.MaSanPham})">edit</i> 
                    <i class="material-icons cursor  icon-delete " onClick="Delete(${full.MaSanPham})">delete</i>`;
                    }
                }]
        });

        var btnAdd = $('<button class="btn-floating btn-small waves-effect waves-light red" style="margin: 25px 0  0  15px; float:right"><i class="material-icons">add</i></button>');
        btnAdd.click(function () {
            $('#' + Global.Element.popupId).modal()[0].M_Modal.options.dismissible = false;
            $('#' + Global.Element.popupId).modal('open');
            M.updateTextFields();
        });
        btnAdd.insertBefore('#tbProducts_filter');
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
        var product = $.map(Global.Data.products, function (item, i) {
            if (item.MaSanPham == Id)
                return item;
        })[0];
        Global.Data.selectedProduct = product;
        Global.Data.Id = product.MaSanPham;
        $('#txtname').val(product.TenSanPham);
        $('#txtDG').val(product.DonGia);
        $('#txtDGCM').val(product.DonGiaCM);
        $('#txtNote').val(product.DinhNghia);
        $('#txtMKH').val(product.MaKhachHang);
        $('#txtNote').val(product.DinhNghia);
        $('#txtDGC').val(product.DonGiaCat);
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
                    MaSanPham: Global.Data.Id,
                    TenSanPham: $('#txtname').val(),
                    DonGia: parseFloat($('#txtDG').val()),
                    DonGiaCM: parseFloat($('#txtDGCM').val()),
                    ProductionTime: parseFloat($('#txtTGCT').val()),
                    DinhNghia: $('#txtNote').val(),
                    MaKhachHang: $('#txtMKH').val(),
                    DonGiaCat: $('#txtDGC').val()
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
            $('#txtDG').val(1);
            $('#txtDGCM').val(1);
            $('#txtNote').val('');
            $('#txtTGCT').val(1);
             $('#txtMKH').val('');
             $('#txtDGC').val(1);
            Global.Data.Id = 0;
            Global.Data.selectedProduct = null;
            $("#" + Global.Element.popupId).modal("close");
        });
    }

    function CheckValidate() {
        if ($('#txtname').val().trim() == "") {
            alert("Nhập tên sản phẩm.");
            $('#txtname').focus();
            return false;
        }
        else if ($('#txtDG').val().trim() == "") {
            alert("Nhập đơn giá.");
            $('#txtDG').focus();
            return false;
        }
        else if (parseFloat($('#txtDG').val()) <= 0) {
            alert("Đơn giá phải lớn hơn 0.");
            $('#txtDG').focus();
            return false;
        }
        else if ($('#txtDGCM').val().trim() == "") {
            alert("Nhập Đơn giá CM.");
            $('#txtDGCM').focus();
            return false;
        }
        else if (parseFloat($('#txtDGCM').val()) <= 0) {
            alert("Đơn giá CM phải lớn hơn 0.");
            $('#txtDGCM').focus();
            return false;
        }
        else if ($('#txtTGCT').val().trim() == "") {
            alert("Nhập thời gian chế tạo.");
            $('#txtTGCT').focus();
            return false;
        }
        else if (parseFloat($('#txtTGCT').val()) <= 0) {
            alert("Thời gian chế tạo phải lớn hơn 0.");
            $('#txtTGCT').focus();
            return false;
        }
        return true;
    }
}
