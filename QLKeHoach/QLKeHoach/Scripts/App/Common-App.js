function GetLines(controlId) {
    $.ajax({
        url: '/Common/GetLines',
        type: 'POST',
        contentType: 'application/json charset=utf-8',
        beforeSend: function () { $('.progress').removeClass('hide'); },
        success: function (objs) {
            $('.progress').addClass('hide');
            var opt = "<option>Không có dữ liệu</option>";
            if (objs != null && objs.length > 0) {
                opt = '';
                objs.map(item => {
                    opt += "<option Value=" + item.Id + ">" + item.Name + "</option>";
                });
            }
            $('#' + controlId).empty().append(opt);
            $('#' + controlId).formSelect();
            $('#' + controlId).change();
        }
    });
}

function GetCustomers(controlId, datalist) {
    $.ajax({
        url: '/Customer/GetSelect',
        type: 'POST',
        contentType: 'application/json charset=utf-8',
        beforeSend: function () { $('.progress').removeClass('hide'); },
        success: function (objs) {
            $('.progress').addClass('hide');
            if (!datalist) {
                var opt = "<option>Không có dữ liệu</option>";
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => {
                        opt += "<option Value=" + item.Id + ">" + (item.Code + " ( " + item.Name + " )") + "</option>";
                    });
                }
                $('#' + controlId).empty().append(opt);
                $('#' + controlId).formSelect();
                $('#' + controlId).change();
            }
            else {
                var opt = ''; 
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => { 
                        opt += '<option value="' + item.Code + '" /> ';
                        opt += '<option value="' + item.Name + '" /> ';
                    });
                }
                $('#' + controlId).empty().append(opt); 
            }
        }
    });
}

function GetCommodities(controlId, datalist) {
    $.ajax({
        url: '/Common/GetCommodities',
        type: 'POST',
        contentType: 'application/json charset=utf-8',
        beforeSend: function () { $('.progress').removeClass('hide'); },
        success: function (objs) {
            $('.progress').addClass('hide');
            if (!datalist) {
                var opt = "<option>Không có dữ liệu</option>";
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => {
                        opt += "<option Value=" + item.MaSanPham + ">" +  item.TenSanPham  + "</option>";
                    });
                }
                $('#' + controlId).empty().append(opt);
                $('#' + controlId).formSelect();
                $('#' + controlId).change();
            }
            else {
                var opt = '';
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => { 
                        opt += '<option value="' + item.TenSanPham + '" /> ';
                    });
                }
                $('#' + controlId).empty().append(opt);
            }
        }
    });
}

function GetSizes(controlId, datalist) {
    $.ajax({
        url: '/Common/GetSizes',
        type: 'POST',
        contentType: 'application/json charset=utf-8',
        beforeSend: function () { $('.progress').removeClass('hide'); },
        success: function (objs) {
            $('.progress').addClass('hide');
            if (!datalist) {
                var opt = "<option>Không có dữ liệu</option>";
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => {
                        opt += "<option Value=" + item.Id + ">" + item.Name + "</option>";
                    });
                }
                $('#' + controlId).empty().append(opt);
                $('#' + controlId).formSelect();
                $('#' + controlId).change();
            }
            else {
                var opt = '';
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => {
                        opt += '<option value="' + item.Name + '" /> ';
                    });
                }
                $('#' + controlId).empty().append(opt);
                return objs;
            }
        }
    });
}

function GetColors(controlId, datalist) {
    $.ajax({
        url: '/Common/GetColors',
        type: 'POST',
        contentType: 'application/json charset=utf-8',
        beforeSend: function () { $('.progress').removeClass('hide'); },
        success: function (objs) {
            $('.progress').addClass('hide');
            if (!datalist) {
                var opt = "<option>Không có dữ liệu</option>";
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => {
                        opt += "<option Value=" + item.Id + ">" + item.Name + "</option>";
                    });
                }
                $('#' + controlId).empty().append(opt);
                $('#' + controlId).formSelect();
                $('#' + controlId).change();
            }
            else {
                var opt = '';
                if (objs != null && objs.length > 0) {
                    opt = '';
                    objs.map(item => {
                        opt += '<option value="' + item.Name + '" /> ';
                    });
                }
                $('#' + controlId).empty().append(opt);
            }
        }
    });
}

function GetCurrencyUnits(controlId) {
    $.ajax({
        url: '/CurrencyUnit/GetSelect',
        type: 'POST',
        contentType: 'application/json charset=utf-8',
        beforeSend: function () { $('.progress').removeClass('hide'); },
        success: function (objs) {
            $('.progress').addClass('hide');
            var opt = "<option>Không có dữ liệu</option>";
            if (objs != null && objs.length > 0) {
                opt = '';
                objs.map(item => {
                    opt += "<option Value=" + item.Id + ">" + item.Name + "</option>";
                });
            }
            $('#' + controlId).empty().append(opt);
            $('#' + controlId).formSelect();
            $('#' + controlId).change();
        }
    });
}
function GetStatus(status) {
    var vnStatus = '';
    switch (status) {
        case 'Draft': vnStatus =  'lưu nháp'; break;
        case 'Approved': vnStatus =  'đã duyệt'; break; 
    }
    return vnStatus;
}