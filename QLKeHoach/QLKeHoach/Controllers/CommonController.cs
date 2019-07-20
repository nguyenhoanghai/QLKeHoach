using PMS.Business;
using PMS.Business.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class CommonController : Controller
    { 
        [HttpPost]
        public JsonResult GetLines()
        {
            var lines = BLLLine.GetLines(2);
            if (lines != null && lines.Count > 0)
                return Json(lines.Select(x => new ModelSelectItem() { Id = x.MaChuyen, Name = x.TenChuyen }).ToList());
            return Json(new List<ModelSelectItem>());
        }
    }
}