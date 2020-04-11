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
            GetById: '/Receipt/GetById',
            Save: '/Receipt/Save',
            Delete: '/Receipt/Delete',
            GetAssignByOrderDetailId: '/Receipt/GetAssignByOrderDetailId',
            saveAssign: '/Assignment/Save',
            deleteAssign: '/Assignment/Delete',
            nhapKH: '/Export/NhapKH'
        },
        Data: {
            Receipts: [],
            selectedReceipt: null,
            table: null,
            Id: 0,
            details: [],
            Commodities: [],
            Sizes: [],
            Colors: [],
            tableChild: null,
            AssignDetails: [],
            AssignSelected: null,
            AssignOfOrderDetails: [],
            AssignOfOrderDetailSelected: null
        },
        Element: {
            popupId: 'modal1',
            popupAssignId: 'modal-assign',
            popupDetail: 'modal-list-detail'
        }
    }

    this.GetGlobal = function () {
        return Global;
    }

    this.Edit = function (Id) {
        Edit(Id);
    }

    this.Assign = function (Id) {
        Assign(Id);
    }

    this.AddAssign = function (Id) {
        AddAssign(Id);
    }
    this.EditAssign = function (Id) {
        EditAssign(Id);
    }
    this.DeleteAssign = function (Id) {
        if (confirm('Những dữ liệu liên quan đến phân công này sẽ bị xóa.Bạn có muốn xóa phân công này ?'))
            DeleteAssign(Id);
    }

    this.Delete = function (Id) {
        if (confirm('Những dữ liệu liên quan đến đơn hàng này sẽ bị xóa. Bạn có muốn xóa đơn hàng này ?'))
            Delete(Id);
    }

    this.Init = function () {
        RegisterEvent();
        InitPopup();
        InitAssignPopup();
        InitDetailPopup();
        GetCustomers('cus-id', false);
        GetCommodities('mahang', true);
        GetSizes('size', true);
        GetColors('mau', true);
        GetCurrencyUnits('unit-id');
        GetLines('line-id');
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

    function GetById(Id) {
        $.ajax({
            url: Global.UrlAction.GetById,
            type: 'POST',
            data: JSON.stringify({ 'Id': Id }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (obj) {
                $('.progress').addClass('hide');
                Global.Data.AssignDetails.length = 0;
                Global.Data.AssignDetails = (obj != null ? obj.Details : []);
                InitTable();
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
            "columns": [
                { "data": "Code", "title": "Mã đơn hàng" },
                { "data": "Name", "title": "Tên đơn hàng" },
                { "data": "CusName", "title": "Khách hàng" },
                {
                    "data": "Total", "title": "Tổng tiền",
                    render: (data, type, full, meta) => {
                        var total = 0;
                        full.Details.map(x => {
                            total = x.Price * x.Quantity;
                        });

                        return '<span>' + total + ' ' + full.CuUnitName + '</span>'
                    }
                },
                { "data": "ExchangeRate", "title": "Tỉ giá" },
                {
                    "data": "Status", "title": "Trạng thái",
                    render: (data, type, full, meta) => {
                        return '<span class="' + data + '">' + GetStatus(data) + '</span>'
                    }
                },
                { "data": "Note", "title": "Ghi chú", "orderable": false },
                {
                    "render": function (data, type, full, meta) {
                        if (full.Status != 'Draft') {
                            return ` 
                                <i class="material-icons icon-edit  cursor" onClick="Assign(${full.Id})">event_note</i> `;
                        }
                        else {
                            return `
                                <i class="material-icons icon-edit  cursor" onClick="Edit(${full.Id})">edit</i> 
                                <i class="material-icons cursor  icon-delete " onClick="Delete(${full.Id})">delete</i>`;
                        }
                    },
                    "orderable": false,
                    width: '100px'
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
            success: function (response) {
                $('.progress').addClass('hide');
                if (response.IsSuccess) {
                    Gets();
                }
                else
                    alert(response.Messages[0].msg);
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
        Global.Data.details = Global.Data.details.concat(Receipt.Details);

        $('#detail-table').show();
        $('#sampleTable').hide();
        AddEmpty();
        DrawDetailTable();

        $('#' + Global.Element.popupId).modal()[0].M_Modal.options.dismissible = false;
        $('#' + Global.Element.popupId).modal('open');
        M.updateTextFields();
        $('select').formSelect();
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
                    Details: Global.Data.details,
                    Status: 'Draft'
                }
                Save(obj);
            }
        });

        $('#modal1 #btnSubmit').click(function () {
            if (CheckValidate()) {
                var obj = {
                    Id: Global.Data.Id,
                    Code: $('#txtcode').val(),
                    Name: $('#txtname').val(),
                    CustomerId: $('#cus-id').val(),
                    Note: $('#txtNote').val(),
                    ExchangeRate: $('#rate').val(),
                    CurrencyUnitId: $('#unit-id').val(),
                    Details: Global.Data.details,
                    Status: 'Approved'
                }
                Save(obj);
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
            $('#' + Global.Data.popupId + ' input,#' + Global.Data.popupId + ' select,#' + Global.Data.popupId + ' textarea').prop("disabled", false);
            $('#' + Global.Data.popupId + ' #btnSave,#' + Global.Data.popupId + ' #btnSubmit').removeClass('hide');
            $('select').formSelect();
            M.updateTextFields();
        });
    }

    function Save(obj) {
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

    function CheckValidate() {
        if ($('#txtcode').val().trim() == "") {
            alert("Nhập mã đơn hàng.");
            $('#txtcode').focus();
            return false;
        }
        else if ($('#txtname').val().trim() == "") {
            alert("Nhập tên đơn hàng.");
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

        if (Global.Data.selectedReceipt && Global.Data.selectedReceipt.Status != 'Draft') {
            $('input, select').prop("disabled", true);
            M.updateTextFields();
            $('select').formSelect();
        }
    }

    function DrawTable_Submit() {
        var table = $('#detail-table tbody');
        table.empty();
        Global.Data.details.map((item, i) => {
            var tr = initTr();
            var td = initTd();
            td.append(GetCommoName(item.ProductId));
            tr.append(td);

            td = initTd();
            td.append(GetColorName(item.ColorId));
            tr.append(td);

            td = initTd();
            td.append(GetSizeName(item.SizeId));
            tr.append(td);

            td = initTd();
            td.append(item.Quantity);
            tr.append(td);

            td = initTd();
            td.append(item.Price);
            tr.append(td);

            td = initTd();
            td.append(item.Note);
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

    function InitTable() {
        if (Global.Data.tableChild != null) {
            Global.Data.tableChild.destroy();
            Global.Data.tableChild = null;
            $("#sampleTable").empty();
        }

        Global.Data.tableChild = $("#sampleTable").DataTable({
            "filter": false, // this is for disable filter (search box)
            "orderMulti": false, // for disable multiple column at once 
            "data": Global.Data.AssignDetails,
            "responsive": true,
            "lengthChange": false,
            paging: false,
            "columns": [
                {
                    "className": 'details-control ',
                    "orderable": false,
                    "data": null,
                    "defaultContent": '',
                    "orderable": false,
                    width: '20px',
                },
                {
                    "data": "ProductId", "title": "Mã hàng",
                    render: function (data, type, row) {
                        return GetCommoName(data);
                    }
                },
                {
                    "data": "ColorId", "title": "Màu",
                    render: function (data, type, row) {
                        return GetColorName(data);
                    }
                },
                {
                    "data": "SizeId", "title": "Size",
                    render: function (data, type, row) {
                        return GetSizeName(data);
                    }
                },
                {
                    "data": "Quantity", "title": "Số lượng"
                },
                {
                    "data": "TotalAssign", "title": "Đã phân công"
                },
                {
                    "title": "Còn lại",
                    render: function (data, type, row) {
                        return '<span class="red-text  ">' + (row.Quantity - row.TotalAssign) + '</span>';
                    }
                },
                {
                    "data": "Price", "title": "Đơn giá"
                }, {
                    "data": "Note", "title": "Ghi chú",
                    "orderable": false
                }
            ],
            "order": [[1, 'asc']]
        }
        );
        // Add event listener for opening and closing details
        $('#sampleTable tbody').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = Global.Data.tableChild.row(tr);
            if (row.child.isShown()) {
                // This row is already open - close it
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                //dong tat ca truoc khi mo cai moi
                Global.Data.tableChild.rows().eq(0).each(function (idx) {
                    var row = Global.Data.tableChild.row(idx);
                    if (row.child.isShown()) {
                        row.child.hide();
                    }
                });

                // Open this row 
                row.child(formatChildRow(row.data().Id)).show();
                tr.addClass('shown');
                GetAssignByOrderDetailId(row.data().Id);
                Global.Data.AssignSelected = $.map(Global.Data.AssignDetails, function (item, i) {
                    if (item.Id == row.data().Id)
                        return item;
                })[0];

            }
        });
        ReDrawFilterAndLengthBoxForGrid(Global.Data.tableChild);
    }

    function GetAssignByOrderDetailId(orderDetailId) {
        $.ajax({
            url: Global.UrlAction.GetAssignByOrderDetailId,
            type: 'POST',
            data: JSON.stringify({ 'orderDetailId': orderDetailId }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (objs) {
                $('.progress').addClass('hide');
                $('#child-table tbody').empty();
                Global.Data.AssignOfOrderDetails.length = 0;
                Global.Data.AssignOfOrderDetails = objs;
                if (objs != null && objs.length > 0) {
                    objs.map(x => {
                        $('#child-table tbody').append(`
                        <tr>
                            <td > ${ x.TenChuyen} </td>
                            <td > ${ x.STTThucHien} </td>
                            <td > ${ x.SanLuongKeHoach} </td>
                            <td > ${ x.LuyKeTH} </td> 
                            <td > ${(x.Price != null ? x.Price : "")} </td> 
                            <td > ${(x.PriceCM != null ? x.PriceCM : "")} </td> 
                            <td > ${(x.PriceCut != null ? x.PriceCut : "")} </td> 
                            <td > ${(x.DateInput != null ? moment(x.DateInput).format("DD/MM/YYYY") : "")} </td>
                            <td > ${(x.DateOutput != null ? moment(x.DateOutput).format("DD/MM/YYYY") : "")} </td>
                            <td >
                                <i class="material-icons icon-edit  cursor" onClick="EditAssign(${x.STT})">edit</i> 
                                <i class="material-icons cursor  icon-delete " onClick="DeleteAssign(${x.STT})">delete</i>
                            </td>
                        </tr>`);
                    });
                } else {
                    $('#child-table tbody').append('<tr><td colspan="10">Không có dữ liệu.</td></tr>');
                }
            }
        });
    }

    function formatChildRow(orderDetailId) {
        var table = ` 
            <table id='child-table' class="table table-striped table-hover table-bordered   centered" cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">
                <thead>
                    <tr >
                        <th class="blue">Chuyền</th>
                        <th class="blue">TT Thực hiện</th>
                        <th class="blue">Sản lượng phân công</th>
                        <th class="blue">LK Thực hiện</th>
                        <th class="blue">Đơn giá</th>
                        <th class="blue">Đơn giá CM</th>
                        <th class="blue">Đơn giá Cắt</th>
                        <th class="blue">Ngày vào chuyền</th>
                        <th class="blue">Ngày nhập kho</th>
                        <th class="blue"><i class="material-icons icon-edit  cursor" style="float :right" onClick="AddAssign(${orderDetailId})">add</i> </th>
                    </tr>
                <thead>
                <tbody>
                    <tr><td colspan="10">đang lấy dữ liệu....</td></tr>
                </tbody>
            </table>`;
        return table;
    }

    function Assign(Id) {
        var Receipt = $.map(Global.Data.Receipts, function (item, i) {
            if (item.Id == Id)
                return item;
        })[0];
        $('#lb-ma-dh').html(Receipt.Code + ' - ' + Receipt.Name);

        var value = $.map($('#cus-id option'), function (ele) {
            if (parseInt(ele.value) == Receipt.CustomerId)
                return ele.text;
        })[0];
        $('#lb-ten-kh').html(value);
        GetById(Receipt.Id);

        $('#' + Global.Element.popupDetail).modal()[0].M_Modal.options.dismissible = false;
        $('#' + Global.Element.popupDetail).modal('open');
    }

    function AddAssign(Id) {
        $('#' + Global.Element.popupAssignId).modal()[0].M_Modal.options.dismissible = false;
        $('#' + Global.Element.popupAssignId).modal('open');
        M.updateTextFields();
        $('select').formSelect();
    }

    function EditAssign(Id) {
        var assign = $.map(Global.Data.AssignOfOrderDetails, function (item, i) {
            if (item.STT == Id)
                return item;
        })[0];
        Global.Data.AssignOfOrderDetailSelected = null;
        if (assign != null) {
            Global.Data.AssignOfOrderDetailSelected = assign;
            $('#stt').val(assign.STT);
            $('#stttt').val(assign.STTThucHien);
            $('#slkh').val(assign.SanLuongKeHoach);
            $('#price').val(assign.Price);
            $('#pricecm').val(assign.PriceCM);
            $('#pricecat').val(assign.PriceCut);
            $('#date-in').val((assign.DateInput != null ? moment(assign.DateInput).format('DD/MM/YYYY') : ''));
            $('#date-out').val((assign.DateOutput != null ? moment(assign.DateOutput).format('DD/MM/YYYY') : ''));
            $('#line-id').val(assign.MaChuyen);
            $('#hieuxuat').val(assign.HieuXuatKH);
            $('#' + Global.Element.popupAssignId).modal()[0].M_Modal.options.dismissible = false;
            $('#' + Global.Element.popupAssignId).modal('open');
            M.updateTextFields();
            $('select').formSelect();
        }
    }

    function DeleteAssign(stt) {
        var assign = $.map(Global.Data.AssignOfOrderDetails, function (item, i) {
            if (item.STT == parseInt(stt))
                return item;
        })[0];
        Global.Data.AssignOfOrderDetailSelected = null;
        if (assign != null) {
            Global.Data.AssignOfOrderDetailSelected = assign;
        }
        $.ajax({
            url: Global.UrlAction.deleteAssign,
            type: 'POST',
            data: JSON.stringify({ 'stt': stt }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (response) {
                $('.progress').addClass('hide');
                if (response.IsSuccess) {
                    Global.Data.AssignDetails.filter(x => {
                        if (x.Id == parseInt(Global.Data.AssignSelected.Id)) {
                            x.TotalAssign -= Global.Data.AssignOfOrderDetailSelected.SanLuongKeHoach;
                        }
                    });
                    $('#' + Global.Element.popupAssignId + ' #btnCancel').click();
                    InitTable();
                }
                else
                    alert(response.Messages[0].msg);
            }
        });
    }

    function InitAssignPopup() {
        $("#" + Global.Element.popupAssignId).modal({
            dismissible: false
        });

        $('#' + Global.Element.popupAssignId + ' #btnSave').click(function () {
            if (checkAssignValidate()) {
                var obj = {
                    STT: $('#stt').val(),
                    MaChuyen: $('#line-id').val(),
                    STTThuchien: $('#stttt').val(),
                    SanLuongKeHoach: $('#slkh').val(),
                    Price: $('#price').val(),
                    PriceCM: $('#pricecm').val(),
                    PriceCut: $('#pricecat').val(),
                    DateInput: $('#date-in').val(),
                    DateOutput: $('#date-out').val(),
                    HieuXuatKH: parseFloat( $('#hieuxuat').val()),
                    OrderDetailId: Global.Data.AssignSelected.Id,
                    ColorId: Global.Data.AssignSelected.ColorId,
                    SizeId: Global.Data.AssignSelected.SizeId,
                    MaSanPham: Global.Data.AssignSelected.ProductId,
                }
                $.ajax({
                    url: Global.UrlAction.saveAssign,
                    type: 'POST',
                    data: JSON.stringify({ 'model': obj, dateIn: $('#date-in').val(), dateOut: $('#date-out').val() }),
                    contentType: 'application/json charset=utf-8',
                    beforeSend: function () { $('.progress').removeClass('hide'); },
                    success: function (response) {
                        $('.progress').addClass('hide');
                        if (response != null && response > 0) {
                            Global.Data.AssignDetails.filter(x => {
                                if (x.Id == parseInt(obj.OrderDetailId)) {
                                    if (parseInt(obj.STT) > 0)
                                        x.TotalAssign -= Global.Data.AssignOfOrderDetailSelected.SanLuongKeHoach;
                                    x.TotalAssign += parseFloat(obj.SanLuongKeHoach);
                                }
                            });
                            $('#' + Global.Element.popupAssignId + ' #btnCancel').click();
                            InitTable();
                        }
                    }
                });
            }
        });

        $('#' + Global.Element.popupAssignId + ' #btnCancel').click(function () {
            $('#txtprice').val('');
            $('#stt').val('0');
            $('#stttt').val('1');
            $('#price').val('1');
            $('#pricecm').val('1');
            $('#pricecat').val('1');
            $('#hieuxuat').val(100)
            var now = moment(new Date());
            $('#date-in').datepicker('setDate', now.format("DD/MM/YYYY"));

            $('.nhap-box').addClass('hide')
            $('.nhap-content').html('');
                                  
            $('#date-out').val(now.format('DD/MM/YYYY'));
            $('#line-id').val('');
            Global.Data.AssignOfOrderDetailSelected = null; 
            $("#" + Global.Element.popupAssignId).addClass('modal-small');
            $("#" + Global.Element.popupAssignId).modal("close");
            $('.add-box').removeClass('m6').addClass('m12');
            $('select').formSelect();
            M.updateTextFields();
        });

        $('#' + Global.Element.popupAssignId + ' #btnNhap').click(function () {
            NhapKH($('#line-id').val(),
                $('#slkh').val(),
                Global.Data.AssignSelected.ProductId,
                parseFloat($('#hieuxuat').val()),
                Global.Data.AssignSelected.SizeId,
                Global.Data.AssignSelected.ColorId);
        });


        $('#slkh').change(function () {
            var value = $(this).val();
            var slcp = Global.Data.AssignSelected.Quantity - Global.Data.AssignSelected.TotalAssign;
            if (Global.Data.AssignOfOrderDetailSelected != null)
                slcp += Global.Data.AssignOfOrderDetailSelected.SanLuongKeHoach;

            slcp = (slcp < 0 ? 0 : slcp);
            if (value > slcp) {
                alert('Bạn đã phân công vượt số lượng còn lại cho phép. Số lượng tối đa còn lại bạn có thể phân công là :' + slcp);
                $(this).val(slcp);
            }
        });

        $('#date-in').datepicker({
            format: 'dd/mm/yyyy',
            defaultDate: new Date(),
            setDefaultDate: true,
            onSelect: (newDate) => {
                if ($('#date-out').val().trim() != '' && moment(newDate, "DD/MM/YYYY").isAfter(moment($('#date-out').val().trim(), "DD/MM/YYYY")))
                    $('#date-out').datepicker({ format: 'dd/mm/yyyy', minDate: newDate, setDefaultDate: true, defaultDate: newDate });
                else
                    $('#date-out').datepicker({ format: 'dd/mm/yyyy', minDate: newDate });
            }
        });
        $('#date-out').datepicker({ format: 'dd/mm/yyyy', defaultDate: new Date(), setDefaultDate: true, minDate: new Date() });
    }

    function checkAssignValidate() {
        if ($('#stttt').val().trim() == "") {
            alert("Nhập thứ tự ưu tiên sản xuất mã hàng.");
            $('#stttt').focus();
            return false;
        }
        else if ($('#slkh').val().trim() == "") {
            alert("Nhập sản lượng kế hoạch phân công đơn hàng.");
            $('#slkh').focus();
            return false;
        }
        else if ($('#line-id').val().trim() == "") {
            alert("Vui lòng chọn chuyền phân công sản xuất.");
            $('#line-id').focus();
            return false;
        } 
        return true;
    }

    function InitDetailPopup() {
        $("#" + Global.Element.popupDetail).modal({
            dismissible: false
        });


        $('#' + Global.Element.popupDetail + ' #btnCancel').click(function () {
            $("#" + Global.Element.popupDetail).modal("close");
        });
    }

    function NhapKH(_machuyen, _slkh, _masp, _hieuxuat, _sizeId,   _colorId) {
        $.ajax({
            url: Global.UrlAction.nhapKH,
            type: 'POST',
            data: JSON.stringify({
                'machuyen': _machuyen,
                'sanluong': _slkh,
                'masp': _masp,
                'hieuxuat': _hieuxuat, 
                sizeId: _sizeId,
                colorId: _colorId
            }),
            contentType: 'application/json charset=utf-8',
            beforeSend: function () { $('.progress').removeClass('hide'); },
            success: function (response) {
                $('.progress').addClass('hide');
                if (response != null) {
                    var str = '';
                    if (!response.IsError) {
                          str = `<ul>
                            <li> ${response.IsFreeNow ? "Hiện tại chuyền " + response.TenChuyen + " đang hết mã hàng." : "Dự kiến ngày kết thúc sản xuất theo kế hoạch hiện tại là <span class='red-text bold'>" + moment(response.NgayKetThucSanXuatHienTai).format("DD/MM/YYYY")+"<span>"}</li>
                            <li> Ngày vào chuyền dự kiến : <span class="red-text bold"> ${moment(response.NgayBatDau).format("DD/MM/YYYY")} </span></li> 
                            <li> Lao động định biên :  <span class="red-text bold"> ${response.LaoDongDB} </span>LĐ</li>  
                            <li> Thời gian làm việc :  <span class="red-text bold"> ${response.ThoiGianLV} </span></li>  
                            <li> Định mức ngày (100% hiệu xuất):  <span class="red-text bold"> ${response.DinhMucNgay} </span>  </li>  
                            <li> Định mức ngày theo hiệu xuất DK :  <span class="red-text bold"> ${response.DinhMucNgayTheoHS} </span>  </li>  
                            <li> Sản lượng phân công :  <span class="red-text bold"> ${response.SanLuongKeHoach} </span></li>  
                            <li> Tổng số ngày sản xuất dự kiến :  <span class="red-text bold"> ${response.SoNgaySX} </span>ngày</li>  
                            <li> Ngày kết thúc dự kiến (khấu trừ ngày CN) :  <span class="red-text bold"> ${moment(response.NgayKetThuc).format("DD/MM/YYYY") } </span></li >  
                           </ul> `;

                        var table = $('#tb-history tbody');
                        table.empty();
                        if (response.LichSu != null && response.LichSu.length > 0) {
                            var strHis = '';
                            response.LichSu.map((item, i) => {
                                strHis +=   `
                                                <tr>
                                                <td>${moment(item.TimeAdd).format('DD/MM/YYYY')}</td>
                                                <td>${item.SanLuongKeHoach}</td>
                                                <td>${item.SoNgaySX}</td>
                                                <td>${item.NangSuatBQ}</td> 
                                                </tr>
                                             ` ;
                            });
                            table.empty().append(strHis);
                        }
                    }
                    else {
                        str = `Lỗi :` + response.ErrorSMS;
                    }
                    $("#" + Global.Element.popupAssignId).removeClass('modal-small');
                    $('.add-box').removeClass('m12').addClass('m6');
                    $('.nhap-content').html(str);
                    $('.nhap-box').removeClass('hide');
                }
            }
        });
    }
}
