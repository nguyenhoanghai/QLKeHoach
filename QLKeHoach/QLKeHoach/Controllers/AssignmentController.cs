using PMS.Business;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class AssignmentController : Controller
    {
        // GET: Assignment
        public ActionResult Index()
        {
            return View();
        }

        public JsonResult Gets(int lineId)
        {
            return Json(BLLAssignmentForLine.Instance.GetDataForGridView(lineId));
        }
    }
}