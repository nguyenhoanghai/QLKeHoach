using PMS.Business;
using PMS.Business.Plan;
using PMS.Data;
using System;
using System.Globalization;
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

        public JsonResult Save (Chuyen_SanPham model, string dateIn, string dateOut)
        {
            model.Thang = DateTime.Now.Month;
            model.Nam = DateTime.Now.Year;
            model.TimeAdd = DateTime.Now;
            if (!string.IsNullOrEmpty(dateIn))
                model.DateInput = DateTime.ParseExact(dateIn, "dd/MM/yyyy", CultureInfo.CurrentCulture);
            if (!string.IsNullOrEmpty(dateOut))
                model.DateOutput = DateTime.ParseExact(dateOut, "dd/MM/yyyy", CultureInfo.CurrentCulture);

            if (model.STT == 0)
                return Json(BLLAssgin.Instance.AddAssign(model));
            return Json(BLLAssgin.Instance.UpdateAssign(model));
        }

        public JsonResult Delete(int stt)
        {
            return Json(BLLAssgin.Instance.DeleteAssign(stt));
        }
    }
}