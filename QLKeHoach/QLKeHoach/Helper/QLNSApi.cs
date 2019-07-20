using PMS.Business.Models;
using QLKeHoach.App_Global;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Web;

namespace QLKeHoach.Helper
{
    public class QLNSApi
    {
        #region Constructor
        private static HttpClient QLNSClient;
        private static object key = new object();
        private static volatile QLNSApi _Instance;
        public static QLNSApi Instance
        {
            get
            {
                if (QLNSApi._Instance == null)
                {
                    lock (QLNSApi.key)
                    {
                        QLNSApi._Instance = new QLNSApi();
                        QLNSApi.QLNSClient = new HttpClient();
                        QLNSApi.QLNSClient.BaseAddress = new Uri(AppGlobal.QLNSUrl);
                    }
                }
                return QLNSApi._Instance;
            }
        }
        private QLNSApi()
        {
        }
        #endregion


        #region commodity

        public List<ProductModel> GetProducts(int  floorId, int isAll)
        {
            try
            {
                string param = string.Empty;
                //for (int i = 0; i < commoIds.Length; i++)
                //{
                //    param += "commoIds=" + commoIds[i];
                //    if (i < commoIds.Length - 1)
                //        param += "&";
                //}
                HttpResponseMessage resp = QLNSClient.GetAsync("api/a_product/gets?floorid="+floorId+"&isall=" + isAll).Result;
                resp.EnsureSuccessStatusCode();
                return resp.Content.ReadAsAsync<List<ProductModel>>().Result;
            }
            catch (Exception)
            { }
            return null;
        }
        #endregion
    }
}