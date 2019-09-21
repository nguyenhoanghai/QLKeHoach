using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QLKeHoach.Data.Model
{
   public class ReceiptDetailModel :P_ReceptDetail
    {
        public string CommoName { get; set; }
        public string SizeName { get; set; }
        public string ColorName { get; set; }
        public int TotalAssign { get; set; }
    }
}
