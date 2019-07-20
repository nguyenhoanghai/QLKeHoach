using PMS.Business;
using PMS.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class SizeController : Controller
    {
        // GET: Size
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult Gets( )
        {
            return Json(BLLSize.Instance.Gets( ));
        }

        [HttpPost]
        public JsonResult Save(P_Size model)
        {
            return Json(BLLSize.Instance.InsertOrUpdate(model));
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            return Json(BLLSize.Instance.Delete(Id));
        }
    }
}