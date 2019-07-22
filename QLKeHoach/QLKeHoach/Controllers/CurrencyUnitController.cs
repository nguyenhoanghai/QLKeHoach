using QLKeHoach.Data.BLL;
using QLKeHoach.Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class CurrencyUnitController : Controller
    { 
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Gets()
        {
            return Json(BLLCurrencyUnit.Instance.Gets());
        }

        [HttpPost]
        public JsonResult GetSelect()
        {
            return Json(BLLCurrencyUnit.Instance.GetSelects());
        }

        [HttpPost]
        public JsonResult Save(CurrencyUnitModel model)
        {
            return Json(BLLCurrencyUnit.Instance.InsertOrUpdate(model));
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            return Json(BLLCurrencyUnit.Instance.Delete(Id));
        }
    }
}