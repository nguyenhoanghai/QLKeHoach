using OfficeOpenXml;
using OfficeOpenXml.Style;
using PMS.Business.Web_KH;
using System;
using System.Collections.Generic;
using System.Drawing;
using System.IO;
using System.Linq;
using System.Web.Mvc;

namespace QLKeHoach.Controllers
{
    public class ExportController : Controller
    {
        // GET: Export
        public ActionResult Index()
        {
            return View();
        }

        public void Excel()
        {
            var data = BLLAssgin.Instance.GetExcelInfo(0);
            var filePath = new FileInfo(Server.MapPath(@"~\files\excel-templates\plan-template.xlsx")); 
            using (var package = new ExcelPackage(filePath))
            {
                var now = DateTime.Now;
                var workbook = package.Workbook;
                int thismonth = now.Month,
                    lastMonth = now.AddMonths(-1).Month,
                    nextMonth = now.AddMonths(1).Month,
                    bd = 6;
                DateTime
                  startOfThisMonth = new DateTime(now.Year, now.Month, 1),
                  endOfThisMonth = startOfThisMonth.AddMonths(1).AddDays(-1),
                  startOfLastMonth = startOfThisMonth.AddMonths(-1),
                  endOfLastMonth = startOfThisMonth.AddDays(-1),
                  startOfNextMonth = startOfThisMonth.AddMonths(1),
                  endOfNextMonth = startOfNextMonth.AddMonths(2).AddDays(-1);

                List<string> charArr = new List<string> { "0", "S", "T", "U", "V", "W", "X", "Y", "Z", "AA", "AB", "AC", "AD", "AE", "AF", "AG", "AH", "AI", "AJ", "AK", "AL", "AM", "AN", "AO", "AP", "AQ", "AR", "AS", "AT", "AU", "AV", "AW", "AZ", };
                #region sheet 1
                var worksheet = (ExcelWorksheet)workbook.Worksheets["Sheet1"];
                worksheet.Cells[1, 19].Value = lastMonth;

                var start2 = 6;
                foreach (var item in data)
                {
                    bd = start2;
                    worksheet.Cells[start2, 1].Value = item.TenChuyen;
                    SetStyle(worksheet.Cells[start2, 1], Color.Blue, false);
                    worksheet.Cells[start2 + 1, 1].Value = "LĐ";
                    SetStyle(worksheet.Cells[start2 + 1, 1], Color.Blue, false);
                    worksheet.Cells[start2 + 2, 1].Value = item.LD;
                    SetStyle(worksheet.Cells[start2 + 2, 1], Color.Red, true);

                    for (int i = 0; i < item.LastMonth.Count; i++)
                    {
                        worksheet.Cells[start2 + i, 3].Value = item.LastMonth[i].TenMaHang;
                        worksheet.Cells[start2 + i, 5].Value = item.LastMonth[i].Size;
                        worksheet.Cells[start2 + i, 6].Value = item.LastMonth[i].Mau;
                        worksheet.Cells[start2 + i, 7].Value = item.LastMonth[i].SLKH;

                        worksheet.Cells[start2 + i, 11].Formula = ("=-J" + (start2 + i) + "-G" + (start2 + i));

                        //sl thang
                        worksheet.Cells[start2 + i, 16].Formula = "=SUM(S" + (start2 + i) + ":AW" + (start2 + i) + ")";
                        //don gia
                        worksheet.Cells[start2 + i, 17].Value = item.LastMonth[i].DonGiaCM;
                        //doanh thu kh
                        worksheet.Cells[start2 + i, 18].Formula = ("=Q" + (start2 + i) + "*P" + (start2 + i));

                        foreach (var day in item.LastMonth[i].dailyInfo.OrderBy(x => x.date).ToList())
                        {
                            worksheet.Cells[start2 + i, (18 + day.date.Day)].Value = day.TH;
                        }
                    }
                   
                    #region
                    start2 = start2 + (item.LastMonth.Count <= 3 ? 3 : item.LastMonth.Count);
                    worksheet.Cells[start2, 2].Value = "Năng suất bình quân:";
                    worksheet.Cells[start2, 2, start2, 3].Merge = true;
                    SetStyle(worksheet.Cells[start2, 2, start2, 3], Color.Blue, true);
                    // ns binh quan
                    worksheet.Cells[start2, 4].Formula = "=P" + start2 + "/S3";
                    SetStyle(worksheet.Cells[start2, 4], Color.Blue, true);

                    worksheet.Cells[start2, 5].Value = "sản phẩm";
                    SetStyle(worksheet.Cells[start2, 5], Color.Blue, true);

                    //tong slkh
                    worksheet.Cells[start2, 7].Formula = "=SUM(G" + bd + ":G" + (start2 - 1) + ")";
                    SetStyle(worksheet.Cells[start2, 7], Color.Red, true);
                    // tong sl trong thang
                    worksheet.Cells[start2, 16].Formula = "=SUM(P" + bd + ":P" + (start2 - 1) + ")";
                    SetStyle(worksheet.Cells[start2, 16], Color.Red, true);
                    //tong doanh thu thang
                    worksheet.Cells[start2, 18].Formula = "=SUM(R" + bd + ":R" + (start2 - 1) + ")";
                    SetStyle(worksheet.Cells[start2, 18], Color.Red, true);
                    #endregion

                    for (int i = 1; i <= 31; i++)
                    {
                        if (i <= endOfLastMonth.Day && startOfLastMonth.AddDays(i - 1).DayOfWeek != DayOfWeek.Sunday)
                        {
                            worksheet.Cells[start2, 18 + i].Formula = "=SUM(" + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + ")";
                            SetStyle(worksheet.Cells[start2, 18 + i], Color.Blue, true);

                            //doanh thu tong ngay
                            worksheet.Cells[start2 + 1, 18 + i].Formula = "=IF(SUM(" + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + ")=0,0,SUMPRODUCT($Q" + bd + ":$Q" + (start2 - 1) + "," + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + "))";
                            SetStyle(worksheet.Cells[start2 + 1, 18 + i], Color.Red, false);

                            //doanh thu đầu máy
                            worksheet.Cells[start2 + 2, 18 + i].Formula = "=" + (charArr[i] + (start2 + 1)) + "/" + item.LD;
                            SetStyle(worksheet.Cells[start2 + 2, 18 + i], Color.Blue, false);
                        }
                    }

                    #region
                    start2++;
                    worksheet.Cells[start2, 15].Value = "Doanh thu hàng ngày (USD):";
                    worksheet.Cells[start2, 15, start2, 17].Merge = true;
                    SetStyle(worksheet.Cells[start2, 15, start2, 17], Color.Red, false);
                    //doanh thu ngay
                    worksheet.Cells[start2, 18].Formula = "=AVERAGEIF(S" + start2 + ":AW" + start2 + ",\"<>0\")";
                    SetStyle(worksheet.Cells[start2, 18], Color.Red, false);

                    start2++;
                    worksheet.Cells[start2, 15].Value = "Doanh thu đầu máy (USD/người):";
                    worksheet.Cells[start2, 15, start2, 17].Merge = true;
                    SetStyle(worksheet.Cells[start2, 15, start2, 17], Color.Blue, false);
                    worksheet.Cells[start2, 1, start2, 55].Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
                    //doanh thu dau nguoi
                    worksheet.Cells[start2, 18].Formula = "=AVERAGEIF(S" + start2 + ":AW" + start2 + ",\"<>0\")";
                    SetStyle(worksheet.Cells[start2, 18], Color.Blue, false);

                    start2 += 1;
                    #endregion
                }
                #endregion

                #region sheet 2
                var worksheet1 = (ExcelWorksheet)workbook.Worksheets["Sheet2"];
                worksheet1.Cells[1, 19].Value = thismonth;
                start2 = 6;
                foreach (var item in data)
                {
                    bd = start2;
                    worksheet1.Cells[start2, 1].Value = item.TenChuyen;
                    SetStyle(worksheet1.Cells[start2, 1], Color.Blue, false);
                    worksheet1.Cells[start2 + 1, 1].Value = "LĐ";
                    SetStyle(worksheet1.Cells[start2 + 1, 1], Color.Blue, false);
                    worksheet1.Cells[start2 + 2, 1].Value = item.LD;
                    SetStyle(worksheet1.Cells[start2 + 2, 1], Color.Red, true);

                    for (int i = 0; i < item.ThisMonth.Count; i++)
                    {
                        worksheet1.Cells[start2 + i, 3].Value = item.ThisMonth[i].TenMaHang;
                        worksheet1.Cells[start2 + i, 5].Value = item.ThisMonth[i].Size;
                        worksheet1.Cells[start2 + i, 6].Value = item.ThisMonth[i].Mau;
                        worksheet1.Cells[start2 + i, 7].Value = item.ThisMonth[i].SLKH;

                        worksheet1.Cells[start2 + i, 11].Formula = ("=-J" + (start2 + i) + "-G" + (start2 + i));

                        //sl thang
                        worksheet1.Cells[start2 + i, 16].Formula = "=SUM(S" + (start2 + i) + ":AW" + (start2 + i) + ")";
                        //don gia
                        worksheet1.Cells[start2 + i, 17].Value = item.ThisMonth[i].DonGiaCM;
                        //doanh thu kh
                        worksheet1.Cells[start2 + i, 18].Formula = ("=Q" + (start2 + i) + "*P" + (start2 + i));

                        foreach (var day in item.ThisMonth[i].dailyInfo.OrderBy(x => x.date).ToList())
                        {
                            worksheet1.Cells[start2 + i, (18 + day.date.Day)].Value = day.TH;
                        }
                    }

                    #region                     
                    start2 = start2 + (item.LastMonth.Count <= 3 ? 3 : item.LastMonth.Count);
                    worksheet1.Cells[start2, 2].Value = "Năng suất bình quân:";
                    worksheet1.Cells[start2, 2, start2, 3].Merge = true;
                    SetStyle(worksheet1.Cells[start2, 2, start2, 3], Color.Blue, true);
                    // ns binh quan
                    worksheet1.Cells[start2, 4].Formula = "=P" + start2 + "/S3";
                    SetStyle(worksheet1.Cells[start2, 4], Color.Blue, true);

                    worksheet1.Cells[start2, 5].Value = "sản phẩm";
                    SetStyle(worksheet1.Cells[start2, 5], Color.Blue, true);

                    //tong slkh
                    worksheet1.Cells[start2, 7].Formula = "=SUM(G" + bd + ":G" + (start2 - 1) + ")";
                    SetStyle(worksheet1.Cells[start2, 7], Color.Red, true);
                    // tong sl trong thang
                    worksheet1.Cells[start2, 16].Formula = "=SUM(P" + bd + ":P" + (start2 - 1) + ")";
                    SetStyle(worksheet1.Cells[start2, 16], Color.Red, true);
                    //tong doanh thu thang
                    worksheet1.Cells[start2, 18].Formula = "=SUM(R" + bd + ":R" + (start2 - 1) + ")";
                    SetStyle(worksheet1.Cells[start2, 18], Color.Red, true);
                    #endregion

                    for (int i = 1; i <= 31; i++)
                    { 
                        if (i <= endOfThisMonth.Day && startOfThisMonth.AddDays(i - 1).DayOfWeek != DayOfWeek.Sunday)
                        {
                            worksheet1.Cells[start2, 18 + i].Formula = "=SUM(" + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + ")";
                            SetStyle(worksheet1.Cells[start2, 18 + i], Color.Blue, true);

                            //doanh thu tong ngay
                            worksheet1.Cells[start2 + 1, 18 + i].Formula = "=IF(SUM(" + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + ")=0,0,SUMPRODUCT($Q" + bd + ":$Q" + (start2 - 1) + "," + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + "))";
                            SetStyle(worksheet1.Cells[start2 + 1, 18 + i], Color.Red, false);

                            //doanh thu đầu máy
                            worksheet1.Cells[start2 + 2, 18 + i].Formula = "=" + (charArr[i] + (start2 + 1)) + "/" + item.LD;
                            SetStyle(worksheet1.Cells[start2 + 2, 18 + i], Color.Blue, false);
                        }
                    }

                    #region                   
                    start2++;
                    worksheet1.Cells[start2, 15].Value = "Doanh thu hàng ngày (USD):";
                    worksheet1.Cells[start2, 15, start2, 17].Merge = true;
                    SetStyle(worksheet1.Cells[start2, 15, start2, 17], Color.Red, false);
                    //doanh thu ngay
                    worksheet1.Cells[start2, 18].Formula = "=AVERAGEIF(S" + start2 + ":AW" + start2 + ",\"<>0\")";
                    SetStyle(worksheet1.Cells[start2, 18], Color.Red, false);

                    start2++;
                    worksheet1.Cells[start2, 15].Value = "Doanh thu đầu máy (USD/người):";
                    worksheet1.Cells[start2, 15, start2, 17].Merge = true;
                    SetStyle(worksheet1.Cells[start2, 15, start2, 17], Color.Blue, false);
                    worksheet1.Cells[start2, 1, start2, 55].Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
                    //doanh thu dau nguoi
                    worksheet1.Cells[start2, 18].Formula = "=AVERAGEIF(S" + start2 + ":AW" + start2 + ",\"<>0\")";
                    SetStyle(worksheet1.Cells[start2, 18], Color.Blue, false);

                    start2 += 1;
                    #endregion
                }

                #endregion

                #region sheet 3
                var worksheet2 = (ExcelWorksheet)workbook.Worksheets["Sheet3"];
                worksheet2.Cells[1, 19].Value = nextMonth;

                start2 = 6;
                foreach (var item in data)
                {
                    bd = start2;
                    worksheet2.Cells[start2, 1].Value = item.TenChuyen;
                    SetStyle(worksheet2.Cells[start2, 1], Color.Blue, false);
                    worksheet2.Cells[start2 + 1, 1].Value = "LĐ";
                    SetStyle(worksheet2.Cells[start2 + 1, 1], Color.Blue, false);
                    worksheet2.Cells[start2 + 2, 1].Value = item.LD;
                    SetStyle(worksheet2.Cells[start2 + 2, 1], Color.Red, true);

                    for (int i = 0; i < item.NextMonth.Count; i++)
                    {
                        worksheet2.Cells[start2 + i, 3].Value = item.NextMonth[i].TenMaHang;
                        worksheet2.Cells[start2 + i, 5].Value = item.NextMonth[i].Size;
                        worksheet2.Cells[start2 + i, 6].Value = item.NextMonth[i].Mau;
                        worksheet2.Cells[start2 + i, 7].Value = item.NextMonth[i].SLKH;

                        worksheet2.Cells[start2 + i, 11].Formula = ("=-J" + (start2 + i) + "-G" + (start2 + i));

                        //sl thang
                        worksheet2.Cells[start2 + i, 16].Formula = "=SUM(S" + (start2 + i) + ":AW" + (start2 + i) + ")";
                        //don gia
                        worksheet2.Cells[start2 + i, 17].Value = item.NextMonth[i].DonGiaCM;
                        //doanh thu kh
                        worksheet2.Cells[start2 + i, 18].Formula = ("=Q" + (start2 + i) + "*P" + (start2 + i));

                        foreach (var day in item.NextMonth[i].dailyInfo.OrderBy(x => x.date).ToList())
                        {
                            worksheet2.Cells[start2 + i, (18 + day.date.Day)].Value = day.TH;
                        }
                    }

                    #region                     
                    start2 = start2 + (item.LastMonth.Count <= 3 ? 3 : item.LastMonth.Count);
                    worksheet2.Cells[start2, 2].Value = "Năng suất bình quân:";
                    worksheet2.Cells[start2, 2, start2, 3].Merge = true;
                    SetStyle(worksheet2.Cells[start2, 2, start2, 3], Color.Blue, true);
                    // ns binh quan
                    worksheet2.Cells[start2, 4].Formula = "=P" + start2 + "/S3";
                    SetStyle(worksheet2.Cells[start2, 4], Color.Blue, true);

                    worksheet2.Cells[start2, 5].Value = "sản phẩm";
                    SetStyle(worksheet2.Cells[start2, 5], Color.Blue, true);

                    //tong slkh
                    worksheet2.Cells[start2, 7].Formula = "=SUM(G" + bd + ":G" + (start2 - 1) + ")";
                    SetStyle(worksheet2.Cells[start2, 7], Color.Red, true);
                    // tong sl trong thang
                    worksheet2.Cells[start2, 16].Formula = "=SUM(P" + bd + ":P" + (start2 - 1) + ")";
                    SetStyle(worksheet2.Cells[start2, 16], Color.Red, true);
                    //tong doanh thu thang
                    worksheet2.Cells[start2, 18].Formula = "=SUM(R" + bd + ":R" + (start2 - 1) + ")";
                    SetStyle(worksheet2.Cells[start2, 18], Color.Red, true);
                    #endregion

                    for (int i = 1; i <= 31; i++)
                    { 
                        if (i <= endOfNextMonth.Day && startOfNextMonth.AddDays(i - 1).DayOfWeek != DayOfWeek.Sunday)
                        {
                            worksheet2.Cells[start2, 18 + i].Formula = "=SUM(" + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + ")";
                            SetStyle(worksheet2.Cells[start2, 18 + i], Color.Blue, true);

                            //doanh thu tong ngay
                            worksheet2.Cells[start2 + 1, 18 + i].Formula = "=IF(SUM(" + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + ")=0,0,SUMPRODUCT($Q" + bd + ":$Q" + (start2 - 1) + "," + (charArr[i] + bd) + ":" + (charArr[i] + (start2 - 1)) + "))";
                            SetStyle(worksheet2.Cells[start2 + 1, 18 + i], Color.Red, false);

                            //doanh thu đầu máy
                            worksheet2.Cells[start2 + 2, 18 + i].Formula = "=" + (charArr[i] + (start2 + 1)) + "/" + item.LD;
                            SetStyle(worksheet2.Cells[start2 + 2, 18 + i], Color.Blue, false);
                        }
                    }

                    #region                   
                    start2++;
                    worksheet2.Cells[start2, 15].Value = "Doanh thu hàng ngày (USD):";
                    worksheet2.Cells[start2, 15, start2, 17].Merge = true;
                    SetStyle(worksheet2.Cells[start2, 15, start2, 17], Color.Red, false);
                    //doanh thu ngay
                    worksheet2.Cells[start2, 18].Formula = "=AVERAGEIF(S" + start2 + ":AW" + start2 + ",\"<>0\")";
                    SetStyle(worksheet2.Cells[start2, 18], Color.Red, false);

                    start2++;
                    worksheet2.Cells[start2, 15].Value = "Doanh thu đầu máy (USD/người):";
                    worksheet2.Cells[start2, 15, start2, 17].Merge = true;
                    SetStyle(worksheet2.Cells[start2, 15, start2, 17], Color.Blue, false);
                    worksheet2.Cells[start2, 1, start2, 55].Style.Border.Bottom.Style = ExcelBorderStyle.Medium;
                    //doanh thu dau nguoi
                    worksheet2.Cells[start2, 18].Formula = "=AVERAGEIF(S" + start2 + ":AW" + start2 + ",\"<>0\")";
                    SetStyle(worksheet2.Cells[start2, 18], Color.Blue, false);

                    start2 += 1;
                    #endregion
                }
                
                #endregion

                Response.ClearContent();
                Response.BinaryWrite(package.GetAsByteArray());
                DateTime dateNow = DateTime.Now;
                string fileName = "export_" + dateNow.ToString("yyMMddhhmmss") + ".xlsx";
                Response.AddHeader("content-disposition", "attachment;filename=" + fileName);
                Response.ContentType = "application/excel";
                Response.Flush();
                Response.End();
            }
        }

        private void SetStyle(ExcelRange cell, Color color, bool bold)
        {
            cell.Style.Font.Color.SetColor(color);
            cell.Style.Font.Bold = bold;
            cell.Style.Border.BorderAround(ExcelBorderStyle.Thin);
        }

        private void AddCellBorder(ExcelWorksheet sheet, int rowIndex)
        {
            sheet.Cells[rowIndex, 2].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            sheet.Cells[rowIndex, 3].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            sheet.Cells[rowIndex, 4].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            sheet.Cells[rowIndex, 5].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            sheet.Cells[rowIndex, 6].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            sheet.Cells[rowIndex, 7].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            sheet.Cells[rowIndex, 8].Style.Border.BorderAround(ExcelBorderStyle.Thin);
            sheet.Cells[rowIndex, 9].Style.Border.BorderAround(ExcelBorderStyle.Thin);
        }

    }

}