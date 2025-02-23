import { NextApiRequest, NextApiResponse } from "next";
import { Sale } from "../../model";
import { SaleModel } from "../../model/schemas";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const ventas = await SaleModel.find({});

  if (req.query.dates !== undefined) {
    const dates: Array<string> = (req.query.dates as string).split("¡");
    const date1 = new Date(dates[0]);
    const date2 = new Date(dates[1]);
    date2.setDate(date2.getDate() + 1);

    const filtered = [];

    ventas.forEach((soli: Sale) => {
      const soliDates = soli.saleDate.replace(",", "").split(" ")[0].split("/");
      const soliDate = new Date(
        soliDates[2] +
          "-" +
          (soliDates[1].length < 2 ? "0" + soliDates[1] : soliDates[1]) +
          "-" +
          (soliDates[1].length < 2 ? "0" + soliDates[0] : soliDates[0])
      );
      if (
        date1.getTime() <= soliDate.getTime() &&
        soliDate.getTime() < date2.getTime()
      ) {
        filtered.push(soli);
      }
    });

    return res.status(200).json({
      message: "todas las ventas",
      data: filtered as Array<Sale>,
      success: true,
    });
  } else {
    return res.status(200).json({
      message: "Todas las ventas",
      data: ventas as Array<Sale>,
      success: true,
    });
  }
}
