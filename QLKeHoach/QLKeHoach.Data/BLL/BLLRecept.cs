using GPRO.Ultilities;
using PMS.Business.Models;
using PMS.Business.Plan.Models;
using QLKeHoach.Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace QLKeHoach.Data.BLL
{
  public  class BLLRecept
    {
        static Object key = new object();
        private static volatile BLLRecept _Instance;
        public static BLLRecept Instance
        {
            get
            {
                if (_Instance == null)
                    lock (key)
                        _Instance = new BLLRecept();

                return _Instance;
            }
        }

        private BLLRecept() { }

        public List<ReceptModel> Gets()
        {
            using (var db = new GproPlanEntities())
            {
                try
                {
                    return (from x in db.P_Reception
                            where !x.IsDeleted
                            select new ReceptModel()
                            {
                                Id = x.Id,
                                Code = x.Code,
                                Name = x.Name,
                                CusName = x.P_Customer.Code,
                                Details = x.P_ReceptDetail.Where(i=>!i.IsDeleted).Select(i=>new ReceiptDetailModel() { Id = 0, ColorId= i.ColorId, ProductId= i.ProductId, SizeId= i.SizeId, Note = i.Note, Quantity = i.Quantity, Price = i.Price }) ,
                                Total = 0,
                                CustomerId= x.CustomerId,
                                CurrencyUnitId = x.CurrencyUnitId,
                                CuUnitName = x.P_CurrencyUnit.Code ,
                                ExchangeRate = x.ExchangeRate,
                                Status = x.Status
                            }).ToList();
                }
                catch (Exception ex)
                {
                }
                return new List<ReceptModel>();
            }
        }

        public  ReceptModel  GetById(int receiptId)
        {
            using (var db = new GproPlanEntities())
            {
                try
                {
                    return (from x in db.P_Reception
                            where !x.IsDeleted && receiptId == x.Id
                            select new ReceptModel()
                            {
                                Id = x.Id,
                                Code = x.Code,
                                Name = x.Name,
                                CusName = x.P_Customer.Code,
                                Details = x.P_ReceptDetail.Where(i => !i.IsDeleted).Select(i => new ReceiptDetailModel() { Id = i.Id, ColorId = i.ColorId, ProductId = i.ProductId, SizeId = i.SizeId, Note = i.Note, Quantity = i.Quantity, Price = i.Price,ReceiptId = i.ReceiptId }),
                                Total = 0,
                                CustomerId = x.CustomerId,
                                CurrencyUnitId = x.CurrencyUnitId,
                                CuUnitName = x.P_CurrencyUnit.Code,
                                ExchangeRate = x.ExchangeRate,
                                Status = x.Status
                            }).ToList().FirstOrDefault();
                }
                catch (Exception ex)
                {
                }
                return null;
            }
        }

        public List<ModelSelectItem> GetSelects()
        {
            using (var db = new GproPlanEntities())
            {
                try
                {
                    return (from x in db.P_Reception
                            where !x.IsDeleted
                            select new ModelSelectItem()
                            {
                                Id = x.Id,
                                Name = (x.Code + " ( " + x.Name + " )")
                            }).ToList();
                }
                catch (Exception)
                {
                }
                return new List<ModelSelectItem>();
            }
        }

        public ResponseBase Delete(int Id)
        {
            var result = new ResponseBase();
            try
            {
                using (var db = new GproPlanEntities())
                {
                    var obj = db.P_Reception.FirstOrDefault(x => x.Id == Id  );
                    if (obj != null)
                    {
                        if (obj.Status!= "Draft")
                        {
                            result.IsSuccess = false;
                            result.Messages.Add(new Message() { msg = "Đơn hàng " + obj.Code + " đã được duyệt không thể xóa. Xóa đơn hàng thất bại.", Title = "Lỗi hành động" });
                        }
                        else
                        {
                            obj.IsDeleted = true;
                            obj.DeletedAt = DateTime.Now;
                            db.SaveChanges();
                            result.IsSuccess = true;
                            result.Messages.Add(new Message() { msg = "Xóa đơn hàng thành công.", Title = "Thông Báo" });
                        }
                    }
                    else
                    {
                        result.IsSuccess = true;
                        result.Messages.Add(new Message() { msg = "Không tìm thấy thông tin đơn hàng . Xóa đơn hàng thất bại.", Title = "Lỗi CSDL" });
                    }
                }
            }
            catch (Exception)
            {
                result.IsSuccess = true;
                result.Messages.Add(new Message() { msg = "Không tìm thấy thông tin đơn hàng . Xóa đơn hàng thất bại.", Title = "Lỗi Exception" });
            }
            return result;
        }
        
        public ResponseBase InsertOrUpdate(ReceptModel objModel)
        {
            var rs = new ResponseBase();
            using (var db = new GproPlanEntities())
            {
                try
                {
                    if (CheckExists(objModel, false, db) != null)
                    {
                        rs.IsSuccess = false;
                        rs.Messages.Add(new Message() { msg = "Mã đơn hàng đã tồn tại. Vui lòng chọn lại mã khác", Title = "Lỗi trùng tên" });
                    }
                    else if (CheckExists(objModel, true, db) != null)
                    {
                        rs.IsSuccess = false;
                        rs.Messages.Add(new Message() { msg = "Tên đơn hàng đã tồn tại. Vui lòng chọn lại tên khác", Title = "Lỗi trùng tên" });
                    }
                    else
                    {
                        P_Reception reception;
                        P_ReceptDetail detail;
                        if (objModel.Id == 0)
                        {
                            reception = new P_Reception();
                            Parse.CopyObject(objModel, ref reception);
                            reception.CreatedAt = DateTime.Now;
                            reception.P_ReceptDetail = new List<P_ReceptDetail>();

                            var detailObjs = objModel.Details.ToList();
                            for (int i = 0; i < detailObjs.Count-1; i++)
                            {
                                detail = new P_ReceptDetail();
                                Parse.CopyObject(detailObjs[i], ref detail); 
                                detail.P_Reception = reception;
                                detail.CreatedAt = reception.CreatedAt; 
                                reception.P_ReceptDetail.Add(detail);
                            }
                            db.P_Reception.Add(reception);
                            rs.IsSuccess = true;
                        }
                        else
                        {
                            reception = db.P_Reception.FirstOrDefault(x => !x.IsDeleted && x.Id == objModel.Id);
                            if (reception != null &&  reception.Status =="Draft")
                            {
                                reception.Code = objModel.Code;
                                reception.Name = objModel.Name; 
                                reception.ExchangeRate = objModel.ExchangeRate; 
                                reception.CurrencyUnitId = objModel.CurrencyUnitId;
                                reception.CustomerId = objModel.CustomerId;
                                reception.Note = objModel.Note;
                                reception.UpdatedAt = DateTime.Now;
                                reception.Status = objModel.Status;
                                db.Database.ExecuteSqlCommand("update P_ReceptDetail set IsDeleted=1 where ReceiptId="+reception.Id);
                                var detailObjs = objModel.Details.ToList();
                                for (int i = 0; i < detailObjs.Count - 1; i++)
                                {
                                    detail = new P_ReceptDetail();
                                    Parse.CopyObject(detailObjs[i], ref detail);
                                    detail.P_Reception = reception;
                                    detail.CreatedAt = reception.UpdatedAt.Value;
                                    reception.P_ReceptDetail.Add(detail);
                                }
                                rs.IsSuccess = true;
                            }
                            else
                            {
                                rs.IsSuccess = false;
                                rs.Messages.Add(new Message() { msg = "Đơn hàng đang thao tác đã được duyệt hoặc đã bị xóa. Vui lòng kiểm tra lại", Title = "Lỗi " });
                            }
                        }
                        if (rs.IsSuccess)
                        {
                            db.SaveChanges();
                            rs.IsSuccess = true;
                        }
                    }
                }
                catch (Exception ex)
                {
                }
            }
            return rs;
        }

        private P_Reception CheckExists(ReceptModel objModel, bool isCheckName, GproPlanEntities db)
        {
            if (isCheckName)
                return db.P_Reception.FirstOrDefault(x => !x.IsDeleted && x.Id != objModel.Id && x.Name.Trim().Equals(objModel.Name));
            else
                return db.P_Reception.FirstOrDefault(x => !x.IsDeleted && x.Id != objModel.Id && x.Code.Trim().Equals(objModel.Code));
        }

        public List<ChuyenPC> MapPOInfo(List<ChuyenPC> model)
        {
            using (var db = new GproPlanEntities())
            {
                var orderDetails = (from x in db.P_ReceptDetail where !x.IsDeleted && !x.P_Reception.IsDeleted select x);
                for (int i = 0; i < model.Count; i++)
                {
                    for (int ii = 0; ii < model[i].LastMonth.Count; ii++)
                    {
                        var orderDetailId = model[i].LastMonth[ii].OrderDetailId;
                        if(orderDetailId != null)
                        {
                            var found = orderDetails.FirstOrDefault(x => x.Id == orderDetailId);
                            if(found!= null)
                            {
                                model[i].LastMonth[ii].PO = (found.P_Reception.Code + " - " + found.P_Reception.Name  );
                                model[i].LastMonth[ii].KhachHang = (found.P_Reception.P_Customer.Code + " - " + found.P_Reception.P_Customer.Name  );
                            }
                        }
                    }
                }
            }
            return model;
        }
    }
}
