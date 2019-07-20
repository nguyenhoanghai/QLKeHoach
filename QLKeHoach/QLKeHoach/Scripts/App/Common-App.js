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