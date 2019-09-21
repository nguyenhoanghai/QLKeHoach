using PMS.Business;
using PMS.Business.Plan;  
using QLKeHoach.Data.BLL;
using QLKeHoach.Data.ENums;
using QLKeHoach.Data.Model; 
using System.Linq; 
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
        public JsonResult GetById(int Id)
        {
            var receipt = BLLRecept.Instance.GetById(Id);
            if(receipt!= null && receipt.Status == eStatusName.Approved && receipt.Details.Count()>0)
            {
                foreach (var item in receipt.Details)
                {
                    item.TotalAssign = BLLAssgin.Instance.CountQuantytiesHasAssign(item.Id);
                }
            }
            return Json(receipt);
        }

        [HttpPost]
        public JsonResult GetAssignByOrderDetailId(int orderDetailId)
        { 
            return Json( BLLAssgin.Instance.LayPhanCong(orderDetailId));
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