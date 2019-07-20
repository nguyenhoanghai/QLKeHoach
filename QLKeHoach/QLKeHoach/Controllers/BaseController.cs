using GPRO.Core.Mvc;
using GPRO.Core.Mvc.Attribute;
using GPRO.Core.Security;
using QLKeHoach.App_Global;
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Routing;

namespace QLKeHoach.Controllers
{
  //  [GPROAuthorize]
    public class BaseController : ControllerCore
    {
        public string defaultPage = string.Empty;
        public bool isAuthenticate = true; 
        public BaseController()
        {
        }

        protected override void Initialize(RequestContext requestContext)
        {
            Authentication.ProductCode = App_Global.AppGlobal.ProductCode;
            var routeDefault = ((System.Web.Routing.Route)requestContext.RouteData.Route).Defaults;
            if (routeDefault != null)
            {
                var valuesDefault = routeDefault.Values.ToList();
                defaultPage = "/" + valuesDefault[0].ToString() + "/" + valuesDefault[1].ToString();
            }
            CheckLogin(requestContext);
        }

    }
}