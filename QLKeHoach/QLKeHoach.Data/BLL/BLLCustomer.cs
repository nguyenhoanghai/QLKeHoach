using PMS.Business.Models;
using QLKeHoach.Data.Model;
using System;
using System.Collections.Generic;
using System.Linq;

namespace QLKeHoach.Data
{
    public class BLLCustomer
    {
        static Object key = new object();
        private static volatile BLLCustomer _Instance;
        public static BLLCustomer Instance
        {
            get
            {
                if (_Instance == null)
                    lock (key)
                        _Instance = new BLLCustomer();

                return _Instance;
            }
        }

        private BLLCustomer() { }

        public List<CustomerModel> Gets()
        {
            using (var db = new GproPlanEntities())
            {
                try
                {
                    return (from x in db.P_Customer
                            where !x.IsDeleted
                            select new CustomerModel()
                            {
                                Id = x.Id,
                                Code = x.Code,
                                Name = x.Name,
                                OwnerName = x.OwnerName,
                                Address = x.Address,
                                Phone = x.Phone
                            }).ToList();
                }
                catch (Exception)
                {
                }
                return new List<CustomerModel>();
            }
        }

        public List<ModelSelectItem> GetSelects()
        {
            using (var db = new GproPlanEntities())
            {
                try
                {
                    return (from x in db.P_Customer
                            where !x.IsDeleted
                            select new ModelSelectItem()
                            {
                                Id = x.Id,
                                Name = x.Name,
                                Code = x.Code
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
                    var obj = db.P_Customer.FirstOrDefault(x => x.Id == Id);
                    if (obj != null)
                    {
                        obj.IsDeleted = true;
                        obj.DeletedDate = DateTime.Now;
                        db.SaveChanges();
                        result.IsSuccess = true;
                        result.Messages.Add(new Message() { msg = "Xóa khách hàng thành công.", Title = "Thông Báo" });
                    }
                    else
                    {
                        result.IsSuccess = true;
                        result.Messages.Add(new Message() { msg = "Không tìm thấy thông tin khách hàng . Xóa khách hàng thất bại.", Title = "Lỗi CSDL" });
                    }
                }
            }
            catch (Exception)
            {
                result.IsSuccess = true;
                result.Messages.Add(new Message() { msg = "Không tìm thấy thông tin khách hàng . Xóa khách hàng thất bại.", Title = "Lỗi Exception" });
            }
            return result;
        }

        public ResponseBase InsertOrUpdate(P_Customer objModel)
        {
            var rs = new ResponseBase();
            using (var db = new GproPlanEntities())
            {
                try
                {
                    if (CheckExists(objModel, false, db) != null)
                    {
                        rs.IsSuccess = false;
                        rs.Messages.Add(new Message() { msg = "Mã khách hàng đã tồn tại. Vui lòng chọn lại mã khác", Title = "Lỗi trùng tên" });
                    }
                    else if (CheckExists(objModel, true, db) != null)
                    {
                        rs.IsSuccess = false;
                        rs.Messages.Add(new Message() { msg = "Tên khách hàng đã tồn tại. Vui lòng chọn lại tên khác", Title = "Lỗi trùng tên" });
                    }
                    else
                    {
                        if (objModel.Id == 0)
                        {
                            objModel.CreatedDate = DateTime.Now;
                            db.P_Customer.Add(objModel);                            
                            rs.IsSuccess = true;
                        }
                        else
                        {
                            var oldObj = db.P_Customer.FirstOrDefault(x => !x.IsDeleted && x.Id == objModel.Id);
                            if (oldObj != null)
                            {
                                oldObj.Code = objModel.Code;
                                oldObj.Name = objModel.Name;
                                oldObj.Phone = objModel.Phone;
                                oldObj.Address = objModel.Address;
                                oldObj.OwnerName = objModel.OwnerName;
                                oldObj.UpdatedDate = DateTime.Now;
                                rs.IsSuccess = true;
                            }
                            else
                            {
                                rs.IsSuccess = false;
                                rs.Messages.Add(new Message() { msg = "khách hàng đang thao tác không tồn tại hoặc đã bị xóa. Vui lòng chọn lại tên khác", Title = "Lỗi trùng tên" });
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

        private P_Customer CheckExists(P_Customer objModel, bool isCheckName, GproPlanEntities db)
        {
            if (isCheckName)
                return db.P_Customer.FirstOrDefault(x => !x.IsDeleted && x.Id != objModel.Id && x.Name.Trim().Equals(objModel.Name));
            else
                return db.P_Customer.FirstOrDefault(x => !x.IsDeleted && x.Id != objModel.Id && x.Code.Trim().Equals(objModel.Code));
        }
    }
}
