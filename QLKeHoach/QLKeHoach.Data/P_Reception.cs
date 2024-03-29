//------------------------------------------------------------------------------
// <auto-generated>
//    This code was generated from a template.
//
//    Manual changes to this file may cause unexpected behavior in your application.
//    Manual changes to this file will be overwritten if the code is regenerated.
// </auto-generated>
//------------------------------------------------------------------------------

namespace QLKeHoach.Data
{
    using System;
    using System.Collections.Generic;
    
    public partial class P_Reception
    {
        public P_Reception()
        {
            this.P_ReceptDetail = new HashSet<P_ReceptDetail>();
        }
    
        public int Id { get; set; }
        public string Code { get; set; }
        public string Name { get; set; }
        public int CurrencyUnitId { get; set; }
        public int CustomerId { get; set; }
        public double ExchangeRate { get; set; }
        public string Note { get; set; }
        public string Status { get; set; }
        public bool IsDeleted { get; set; }
        public System.DateTime CreatedAt { get; set; }
        public Nullable<int> CreatedBy { get; set; }
        public Nullable<int> UpdatedBy { get; set; }
        public Nullable<System.DateTime> UpdatedAt { get; set; }
        public Nullable<int> DeletedBy { get; set; }
        public Nullable<System.DateTime> DeletedAt { get; set; }
        public Nullable<int> ApprovedBy { get; set; }
        public Nullable<System.DateTime> ApprovedAt { get; set; }
        public Nullable<System.DateTime> DoneAt { get; set; }
        public Nullable<int> DoneBy { get; set; }
    
        public virtual P_CurrencyUnit P_CurrencyUnit { get; set; }
        public virtual P_Customer P_Customer { get; set; }
        public virtual ICollection<P_ReceptDetail> P_ReceptDetail { get; set; }
    }
}
