using PMS.Business;
using PMS.Data;
using QLKeHoach.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class ProductController :  Controller
    {
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Gets(int FloorId, int IsAll)
        { 
            return Json(BLLCommodity.GetAll(FloorId, IsAll)); 
        }

        [HttpPost]
        public JsonResult Save(SanPham model)
        {
            return Json(BLLCommodity.InsertOrUpdate(model));
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            return Json(BLLCommodity.Delete(Id));
        }
    }
}