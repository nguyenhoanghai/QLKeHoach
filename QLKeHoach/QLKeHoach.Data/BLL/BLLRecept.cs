using PMS.Business.Models;
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
                                //OwnerName = x.OwnerName,
                                //Address = x.Address,
                                //Phone = x.Phone
                            }).ToList();
                }
                catch (Exception)
                {
                }
                return new List<ReceptModel>();
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
                var db = new GproPlanEntities();
                var obj = db.P_Reception.FirstOrDefault(x => x.Id == Id);
                if (obj != null)
                {
                    obj.IsDeleted = true;
                    db.SaveChanges();
                    result.IsSuccess = true;
                    result.Messages.Add(new Message() { msg = "Xóa đơn hàng thành công.", Title = "Thông Báo" });
                }
                else
                {
                    result.IsSuccess = true;
                    result.Messages.Add(new Message() { msg = "Không tìm thấy thông tin đơn hàng . Xóa đơn hàng thất bại.", Title = "Lỗi CSDL" });
                }
            }
            catch (Exception)
            {
                result.IsSuccess = true;
                result.Messages.Add(new Message() { msg = "Không tìm thấy thông tin đơn hàng . Xóa đơn hàng thất bại.", Title = "Lỗi Exception" });
            }
            return result;
        }

        public ResponseBase InsertOrUpdate(P_Reception objModel)
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
                        if (objModel.Id == 0)
                        {
                            db.P_Reception.Add(objModel);
                            rs.IsSuccess = true;
                        }
                        else
                        {
                            var oldObj = db.P_Reception.FirstOrDefault(x => !x.IsDeleted && x.Id == objModel.Id);
                            if (oldObj != null)
                            {
                                oldObj.Code = objModel.Code;
                                oldObj.Name = objModel.Name;
                                //oldObj.Phone = objModel.Phone;
                                //oldObj.Address = objModel.Address;
                                //oldObj.OwnerName = objModel.OwnerName;
                                rs.IsSuccess = true;
                            }
                            else
                            {
                                rs.IsSuccess = false;
                                rs.Messages.Add(new Message() { msg = "đơn hàng đang thao tác không tồn tại hoặc đã bị xóa. Vui lòng chọn lại tên khác", Title = "Lỗi trùng tên" });
                            }
                        }
                        if (rs.IsSuccess)
                        {
                            db.SaveChanges();
                            rs.IsSuccess = true;
                        }
                    }
                }
                catch (Exception)
                {
                }
            }
            return rs;
        }

        private P_Reception CheckExists(P_Reception objModel, bool isCheckName, GproPlanEntities db)
        {
            if (isCheckName)
                return db.P_Reception.FirstOrDefault(x => !x.IsDeleted && x.Id != objModel.Id && x.Name.Trim().Equals(objModel.Name));
            else
                return db.P_Reception.FirstOrDefault(x => !x.IsDeleted && x.Id != objModel.Id && x.Code.Trim().Equals(objModel.Code));
        }
    }
}
