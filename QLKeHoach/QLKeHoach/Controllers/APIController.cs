using PMS.Business.Models;
using QLKeHoach.Helper;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class APIController : Controller
    {
        #region  Product
        [HttpPost]
        public JsonResult GetProducts(int floorId, int isAll)
        {
            JsonDataResult.Result = "OK";
            JsonDataResult.Data = QLNSApi.Instance.GetProducts(floorId, isAll);
            return Json(JsonDataResult);
        }
        #endregion
    }
}