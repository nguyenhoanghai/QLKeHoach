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
GPRO.namespace('Receipt');
GPRO.Receipt = function () {
    var Global = {
        UrlAction: {
            Gets: '/Receipt/Gets',
            Save: '/Receipt/Save',
            Delete: '/Receipt/Delete'
        },
        Data: {
            Receipts: [],
            selectedReceipt: null,
            table: null,
            Id: 0,
            details: [],
            Commodities: [],
            Sizes: [],
            Colors: []
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
        if (confirm('Những dữ liệu liên quan đến hóa đơn này sẽ bị xóa. Bạn có muốn xóa hóa đơn này ?'))
            Delete(Id);
    }

    this.Init = function () {
        RegisterEvent();
        InitPopup();
        GetCustomers('cus-id', false);
        GetCommodities('mahang', true);
        GetSizes('size', true);
        GetColors('mau', true);
        GetCurrencyUnits('unit-id');
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
                    $('#tbReceipts').empty();
                    Global.Data.table = null;
                }
                Global.Data.Receipts = null;
                Global.Data.Receipts = objs;
                DrawTable(objs);
                ReDrawFilterAndLengthBoxForGrid(Global.Data.table);
                $('.table-responsive').show();
            }
        });
    }

    function DrawTable(objs) {
        Global.Data.table = $("#tbReceipts").DataTable({
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
                        "targets": [5],
                        "orderable": false,
                    },
                    {
                        "targets": [6],
                        "visible": true,
                        "searchable": false,
                        "orderable": false,
                        className: "action-box"
                    }],

            "columns": [
                { "data": "Code", "title": "Mã hóa đơn" },
                { "data": "Name", "title": "Tên hóa đơn" },
                { "data": "CusName", "title": "Khách hàng" },
                {
                    "data": "Total", "title": "Tổng tiền",
                    render: (data, type, full, meta) => {
                        return '<span>' + data + ' ' + full.CuUnitName + '</span>'
                    }
                },
                { "data": "ExchangeRate", "title": "Tỉ giá" },
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
            Global.Data.details.length = 0;
            AddEmpty();
            AddEmpty();
            DrawDetailTable();

            $('#' + Global.Element.popupId).modal()[0].M_Modal.options.dismissible = false;
            $('#' + Global.Element.popupId).modal('open');
            M.updateTextFields();
        });
        btnAdd.insertBefore('#tbReceipts_filter');
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
        var Receipt = $.map(Global.Data.Receipts, function (item, i) {
            if (item.Id == Id)
                return item;
        })[0];
        Global.Data.selectedReceipt = Receipt;
        Global.Data.Id = Receipt.Id;
        $('#txtcode').val(Receipt.Code);
        $('#txtname').val(Receipt.Name);
        $('#cus-id').val(Receipt.CustomerId);
        $('#unit-id').val(Receipt.CurrencyUnitId);
        $('#rate').val(Receipt.ExchangeRate);
        $('#txtNote').val(Receipt.Note);

        Global.Data.details = Global.Data.details.concat(Receipt.Details) ;
        AddEmpty();
        DrawDetailTable();

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
                    Name: $('#txtname').val(),
                    CustomerId: $('#cus-id').val(),
                    Note: $('#txtNote').val(),
                    ExchangeRate: $('#rate').val(),
                    CurrencyUnitId: $('#unit-id').val(),
                    Details: Global.Data.details
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
            $('#txtcode').val('');
            $('#cus-id').val('');
            $('#unit-id').val('');
            $('#txtNote').val('');
            $('#rate').val(1);
            Global.Data.details.length = 0;
            Global.Data.Id = 0;
            Global.Data.selectedReceipt = null;
            $("#" + Global.Element.popupId).modal("close");
        });
    }

    function CheckValidate() {
        if ($('#txtcode').val().trim() == "") {
            alert("Nhập mã hóa đơn.");
            $('#txtcode').focus();
            return false;
        }
        else if ($('#txtname').val().trim() == "") {
            alert("Nhập tên hóa đơn.");
            $('#txtname').focus();
            return false;
        }
        else if ($('#cus-id').val().trim() == "") {
            alert("Vui lòng chọn khách hàng.");
            $('#cus-id').focus();
            return false;
        } else if ($('#unit-id').val().trim() == "") {
            alert("Vui lòng chọn đơn vị tiền tệ.");
            $('#unit-id').focus();
            return false;
        }
        else if ($('#rate').val().trim() == "") {
            alert("Vui lòng nhập tỉ giá ngoại tệ.");
            $('#rate').focus();
            return false;
        }
        else if (parseFloat($('#rate').val()) < 0) {
            alert("Vui lòng nhập tỉ giá ngoại tệ lớn hơn 0.");
            $('#rate').focus();
            return false;
        }
        return true;
    }

    function DrawDetailTable() {
        console.log(Global.Data.details);

        var table = $('#detail-table tbody');
        table.empty();
        Global.Data.details.map((item, i) => {
            var tr = initTr();
            var td = initTd();
            var mahang = initInput('text', '', 'mahang', i);
            if (item.ProductId != null && item.ProductId != 0)
                mahang.val(GetCommoName(item.ProductId));
            mahang.change((evt) => {
                var control = $(evt.target);
                var index = parseInt(control.attr('index'));
                var lastValue = Global.Data.details[index].CommoName;
                var currentValue = control.val().trim();
                var selectItem = Global.Data.details[index];
                if (currentValue != lastValue) {
                    var foundLib = Global.Data.Commodities.filter(x => { return x.TenSanPham.trim() == currentValue });
                    if (foundLib != null && foundLib.length > 0) {
                        var found = Global.Data.details.filter((item, i) => {
                            return (i != index &&
                                item.ProductId == foundLib[0].MaSanPham &&
                                selectItem.SizeId == item.SizeId &&
                                selectItem.ColorId == item.ColorId);
                        });
                        if (found != null && found.length > 0) {
                            alert('Thông tin mã hàng bạn vừa chọn đã tồn tại. Vui lòng chọn lại mã hàng khác.!')
                        }
                        else {
                            Global.Data.details[index].CommoName = currentValue;
                            Global.Data.details[index].ProductId = foundLib[0].MaSanPham;
                        }

                        if (Global.Data.details.length - 1 == index)
                            AddEmpty();
                    }
                    else {
                        alert('Thông tin mã hàng bạn vừa chọn không tồn tại trong hệ thống. Vui lòng chọn lại mã hàng !')
                    }
                    DrawDetailTable();
                }
            });
            td.append(mahang);
            tr.append(td);

            td = initTd();
            var mau = initInput('text', '', 'mau', i);
            if (item.ColorId != null && item.ColorId != 0)
                mau.val(GetColorName(item.ColorId));
            mau.change((evt) => {
                var control = $(evt.target);
                var index = parseInt(control.attr('index'));
                var lastValue = Global.Data.details[index].ColorName;
                var currentValue = control.val().trim();
                var selectItem = Global.Data.details[index];
                if (currentValue != lastValue) {
                    var foundLib = Global.Data.Colors.filter(x => { return x.Name.trim() == currentValue });
                    if (foundLib != null && foundLib.length > 0) {
                        var found = Global.Data.details.filter((item, i) => {
                            return (i != index &&
                                item.ProductId == selectItem.ProductId &&
                                selectItem.SizeId == item.SizeId &&
                                foundLib[0].Id == item.ColorId);
                        });
                        if (found != null && found.length > 0) {
                            alert('Thông tin màu bạn vừa chọn đã tồn tại. Vui lòng chọn lại màu khác.!')
                        }
                        else {
                            Global.Data.details[index].ColorName = currentValue;
                            Global.Data.details[index].ColorId = foundLib[0].Id;
                        }
                        if (Global.Data.details.length - 1 == index)
                            AddEmpty();
                    }
                    else {
                        alert('Thông tin màu bạn vừa chọn không tồn tại trong hệ thống. Vui lòng chọn lại màu !')
                    }
                    DrawDetailTable();
                }
            });
            td.append(mau);
            tr.append(td);

            td = initTd();
            var size = initInput('text', '', 'size', i);
            if (item.SizeId != null && item.SizeId != 0)
                size.val(GetSizeName(item.SizeId));
            size.change((evt) => {
                var control = $(evt.target);
                var index = parseInt(control.attr('index'));
                var lastValue = Global.Data.details[index].SizeName;
                var currentValue = control.val().trim();
                var selectItem = Global.Data.details[index];
                if (currentValue != lastValue) {
                    var foundLib = Global.Data.Sizes.filter(x => { return x.Name.trim() == currentValue });
                    if (foundLib != null && foundLib.length > 0) {
                        var found = Global.Data.details.filter((item, i) => {
                            return (i != index &&
                                selectItem.ProductId == item.ProductId &&
                                foundLib[0].Id == item.SizeId &&
                                selectItem.ColorId == item.ColorId);
                        });
                        if (found != null && found.length > 0) {
                            alert('Thông tin size bạn vừa chọn đã tồn tại. Vui lòng chọn lại size khác.!')
                        }
                        else {
                            Global.Data.details[index].SizeName = currentValue;
                            Global.Data.details[index].SizeId = foundLib[0].Id;
                        }
                        if (Global.Data.details.length - 1 == index)
                            AddEmpty();
                    }
                    else {
                        alert('Thông tin size bạn vừa chọn không tồn tại trong hệ thống. Vui lòng chọn lại size !')
                    }
                    DrawDetailTable();
                }
            });
            td.append(size);
            tr.append(td);

            td = initTd();
            var sl = initInput('number', 'number', ' ', i);
            sl.val(item.Quantity);
            sl.change((evt) => {
                var control = $(evt.target);
                Global.Data.details[parseInt(control.attr('index'))].Quantity = parseInt(control.val());
                DrawDetailTable();
            });
            td.append(sl);
            tr.append(td);

            td = initTd();
            var dongia = initInput('number', 'number', ' ', i);
            dongia.val(item.Price);
            dongia.change((evt) => {
                var control = $(evt.target);
                Global.Data.details[parseInt(control.attr('index'))].Price = parseFloat(control.val());
                DrawDetailTable();
            });
            td.append(dongia);
            tr.append(td);

            td = initTd();
            var note = initTextarea(i);
            note.val(item.Note);
            note.change((evt) => {
                var control = $(evt.target);
                Global.Data.details[parseInt(control.attr('index'))].Note = control.val();
                DrawDetailTable();
            });
            td.append(note);
            tr.append(td);
            table.append(tr);
        });
    }

    function initTr() {
        return $('<tr></tr>');
    }

    function initTd() {
        return $('<td></td>');
    }

    function initInput(type, className, list, index) {
        if (list != null)
            return $('<input list="' + list + '" index="' + index + '" type="' + type + '" class="' + className + '" />');
        else
            return $('<input  type="' + type + '" index="' + index + '" class="' + className + '" />');
    }

    function initTextarea(index) {
        return $('<textarea class="materialize-textarea" index="' + index + '"></textarea>');
    }

    function AddEmpty() {
        Global.Data.details.push({
            Id: 0,
            ProductId: 0,
            CommoName: '',
            ColorId: 0,
            ColorName: '',
            SizeId: 0,
            SizeName: '',
            Quantity: 0,
            Price: 0,
            Note: ''
        })
    }

    function GetSizeName(id) {
        return Global.Data.Sizes.filter(x => { return x.Id == id })[0].Name;
    }
    function GetColorName(id) {
        return Global.Data.Colors.filter(x => { return x.Id == id })[0].Name;
    }
    function GetCommoName(id) {
        return Global.Data.Commodities.filter(x => { return x.MaSanPham == id })[0].TenSanPham;
    }
}
