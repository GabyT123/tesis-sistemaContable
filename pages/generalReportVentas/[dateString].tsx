import { useEffect, useState } from "react";
import HttpClient from "../../lib/utils/http_client";
import { useAuth } from "../../lib/hooks/use_auth";
import Router from "next/router";
import { Sale } from "../../model";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

const GeneralReportHistory = () => {
  const { auth } = useAuth();
  const [ventas, setVentas] = useState<Map<string, Array<Sale>>>(new Map());
  const [venta, setVenta] = useState<any>();

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const loadData = async () => {
    if (Router.asPath !== Router.route) {
      const dateString = Router.query.dateString as string;

      // Obtener Ventas desde la API
      const response = await HttpClient(
        "/api/ventas?dates=" + dateString,
        "GET",
        auth.userName,
        auth.role
      );

      // Validar que la respuesta tenga datos
      if (response && response.data) {
        console.log(response.data); // Verifica en la consola los datos obtenidos
        setVentas(new Map([["ventas", response.data]])); // Guardamos las ventas en el estado
        setVenta(response.data);
        console.log(venta);
      } else {
        console.warn("No se encontraron ventas");
      }
    } else {
      setTimeout(loadData, 1000);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fecha = Router.query.dateString;

  // Convertimos el Map a un array antes de usar reduce
  const resumenVentas = Array.from(ventas.values())
    .flat()
    .reduce(
      (acc, venta) => {
        const totalVenta = venta.product.reduce((sum, p) => sum + p.price, 0);
        const totalProductos = venta.product.length;

        acc.totalVentas += 1; // Contamos cada venta
        acc.totalVenta += totalVenta; // Sumamos los totales de ventas
        acc.totalProductosVendidos += totalProductos; // Sumamos los productos vendidos

        return acc;
      },
      { totalVentas: 0, totalVenta: 0, totalProductosVendidos: 0 }
    );

  return (
    <>
      <title>Reporte General</title>

      {/* <LoadingContainer visible={!loading}> */}
      <style>
        {`
          body {
            background-color: #f8f9fa !important;
          }
          @media print {
            .clase-a-ocultar {
              display: none !important;
            }
          }
        `}
      </style>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-10 my-4 text-center clase-a-ocultar">
        <button
          className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-600 transition"
          onClick={() => window.print()}
        >
          Imprimir
        </button>

        <button
          className="bg-gray-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-gray-600 transition"
          onClick={() => window.history.back()}
        >
          Volver
        </button>
      </div>

      <div className="px-5">
        <h4 className="text-center text-xl font-bold mb-3">
          REPORTE GERENCIAL {fecha}
        </h4>
        <h5 className="text-center text-lg font-semibold my-3">
          VENTAS REALIZADAS
        </h5>
        <div className="mb-2">
          <p><b>Valor total de todas las ventas:</b> ${resumenVentas.totalVenta.toFixed(2)}</p>
        </div>

        {ventas.get("ventas")?.map((venta, index) => (
          <>
            <div
              key={venta.id}
              className="border rounded-lg shadow-lg p-4 mb-6 bg-white"
            >
              {/* Resumen de la Venta */}
              <div className="mb-4">
                <p>
                  <strong>Fecha de Venta:</strong> {venta.saleDate}
                </p>
                <p>
                  <strong>Cliente:</strong> {venta.customer?.name || "N/A"}
                </p>
                <p>
                  <strong>Email:</strong> {venta.customer?.email || "N/A"}
                </p>
                <p>
                  <strong>Teléfono:</strong> {venta.customer?.phone || "N/A"}
                </p>
                <p>
                  <strong>Total de la Venta:</strong> $
                  {venta.product.reduce((sum, p) => sum + p.price, 0)}
                </p>
              </div>

              {/* Tabla de Productos Vendidos */}
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-200">
                    <th className="border p-2">#</th>
                    <th className="border p-2">Producto</th>
                    <th className="border p-2">Precio (USD)</th>
                    <th className="border p-2">Categoría</th>
                    <th className="border p-2">Descripción</th>
                  </tr>
                </thead>
                <tbody>
                  {venta.product.map((producto, i) => (
                    <tr key={producto.id} className="text-center">
                      <td className="border p-2">{i + 1}</td>
                      <td className="border p-2">{producto.name || "N/A"}</td>
                      <td className="border p-2">${producto.price}</td>
                      <td className="border p-2">
                        {producto.category || "N/A"}
                      </td>
                      <td className="border p-2">
                        {producto.description || "Sin descripción"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ))}
      </div>
      {/* </LoadingContainer> */}
    </>
  );
};
export default GeneralReportHistory;
