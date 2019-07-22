using PMS.Business;
using QLKeHoach.Data;
using QLKeHoach.Data.BLL;
using QLKeHoach.Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class ReceiptController : Controller
    {
        // GET: Receipt
        public ActionResult Index()
        {
            ViewBag.Sizes = BLLSize.Instance.GetSelects();
            ViewBag.Colors = BLLColor.Instance.GetSelects();
            ViewBag.Commos = BLLCommodity.GetAll(1,1);
            return View();
        }

        [HttpPost]
        public JsonResult Gets()
        {
            return Json(BLLRecept.Instance.Gets());
        }

        [HttpPost]
        public JsonResult Save(ReceptModel model)
        {
            return Json(BLLRecept.Instance.InsertOrUpdate(model));
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            return Json(BLLRecept.Instance.Delete(Id));
        }
    }
}