using QLKeHoach.Data;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class CustomerController : Controller
    {
        // GET: Customer
        public ActionResult Index()
        {
            return View();
        }

        [HttpPost]
        public JsonResult GetSelect()
        {
            return Json(BLLCustomer.Instance.GetSelects());
        }

        [HttpPost]
        public JsonResult Gets()
        {
            return Json(BLLCustomer.Instance.Gets());
        }

        [HttpPost]
        public JsonResult Save(P_Customer model)
        {
            return Json(BLLCustomer.Instance.InsertOrUpdate(model));
        }

        [HttpPost]
        public JsonResult Delete(int Id)
        {
            return Json(BLLCustomer.Instance.Delete(Id));
        }
    }
}