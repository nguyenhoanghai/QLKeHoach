using System;
using System.Collections.Generic;
using System.Configuration;
using System.Linq;
using System.Web;

namespace QLKeHoach.App_Global
{
    public static partial class AppGlobal
    { 
        public static string ProductCode = "GPRO_KEHOACH";
        public static string QLNSUrl
        {
            get { return ConfigurationManager.AppSettings["QLNSUrl"]; }
        }
    }
}