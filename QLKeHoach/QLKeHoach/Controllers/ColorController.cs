using PMS.Business;
using PMS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class ColorController : Controller
    {
        // GET: Color
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Gets( )
        {
            return Json(BLLColor.Instance.Gets( ));
        }

        [HttpPost]
        public JsonResult Save(P_Color model)
        {
            return Json(BLLColor.Instance.InsertOrUpdate(model));
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            return Json(BLLColor.Instance.Delete(Id));
        }
    }
}