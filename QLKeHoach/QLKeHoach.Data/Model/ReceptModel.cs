using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QLKeHoach.Data.Model
{
   public class ReceptModel : P_Reception
    {
        public string CusName { get; set; }
        public double Total { get; set; }
        public string CuUnitName   { get; set; }
        public IEnumerable<ReceiptDetailModel> Details { get; set; }
        public ReceptModel()
        {
            Details = new List<ReceiptDetailModel>();
        }
    }
}
