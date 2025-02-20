/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../../../lib/hooks/use_auth";
import { Product, ResponseData, Sale } from "../../../model";

import Router from "next/router";
import HttpClient from "../../../lib/utils/http_client";
import FormatedDate from "../../../lib/utils/formated_date";
import theme from "../../../lib/styles/theme";

const ReporteUnaVenta = () => {
  const { auth } = useAuth();
  const [product, setProduct] = useState<Array<Product>>([]);
  const [editingFacture, setEditingFacture] = useState<Product | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string>(null);
  const [initialValues, setInitialValues] = useState<Sale>({
    quantity: 0,
    customer: {
      name: "",
      email: "",
      phone: "",
      address: "",
    },
    saleDate: FormatedDate(),
    product: [],
    totalPrice: 0,
  });
  const componentRef = useRef(null);

  const loadData = async () => {
    if (Router.asPath !== Router.route) {
      const solicitudeId = Router.query.id as string;
      const response: ResponseData = await HttpClient(
        "/api/ventas/" + solicitudeId,
        "GET",
        auth.userName,
        auth.role
      );
      setInitialValues(response.data);
      setProduct(response.data.items);
    } else {
      setTimeout(loadData, 1000);
    }
  };
  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const facturesColumns: Array<string> = [
    "Cantidad",
    "Nombre del producto",
    "Valor del producto",
  ];

  return (
    <>
      <title>Reporte de venta</title>

      {initialValues === null ? (
        <div>Error al cargar los datos</div>
      ) : (
        <div className="bg-white min-h-screen flex">
          <div
            style={{
              width: "297mm",
              position: "relative",
              margin: "0 auto",
              marginBottom: "5%",
            }}
          >
            <style>
              {`
                  body {
                    background-color: white !important;
                  }
                  @media print {
                    .clase-a-ocultar {
                      display: none !important;
                    }
                  }
                `}
            </style>

            <div className="grid grid-cols-0 md:grid-cols-3 m-4 gap-4 mb-4 clase-a-ocultar">
              <button
                className="text-center bg-transparent hover:bg-red-500 text-red-500 font-semibold hover:text-white mx-auto my-4 px-4 py-2.5 border border-red-500 hover:border-transparent rounded-full text-sm"
                onClick={() => window.print()}
              >
                Imprimir
              </button>

              <button
                className="text-center bg-transparent hover:bg-gray-500 text-gray-500 font-semibold hover:text-white mx-auto my-4 px-4 py-2.5 border border-gray-500 hover:border-transparent rounded-full text-sm"
                onClick={() => Router.back()}
              >
                Volver
              </button>
            </div>
            <div ref={componentRef}>
              <table width="100%">
                <tr>
                  <td width={"50%"}>
                    <h6
                      className="mx-4 bg-gray-400"
                      style={{
                        padding: "20px 35px 20px 35px",
                        fontWeight: 600,
                        color: "white",
                        textAlign: "center",
                      }}
                    >
                      DETALLE DE VENTA
                    </h6>
                  </td>
                  <td width={"50%"} className="text-center">
                    
                  </td>
                </tr>
              </table>
              <h4 className="text-center my-3" style={{ fontSize: "20px" }}>
                COMERCIAL TORRES - DETALLE DE VENTA
              </h4>
              <table
                style={{ fontSize: "16px", textAlign: "center" }}
                className="mb-3"
                width="95%"
                align="center"
                border={2}
              >
                <tr>
                  <td style={{ width: "13%" }}>
                    <p>
                      <strong>CLIENTE: </strong>
                      {initialValues.customer.name}
                    </p>
                  </td>

                  <td style={{ width: "12%" }}>
                    <p>
                      <strong>FECHA DE SOLICITUD: </strong>
                      {initialValues.saleDate.split("  ")[0]}
                    </p>
                  </td>
                </tr>
              </table>
              <table
                width={"100%"}
                align="center"
                style={{ fontSize: "11px" }}
                border={1}
                className="table table-striped"
              >
                <thead>
                  <tr>
                    {facturesColumns.map((item, index) => (
                      <th
                        className="p-1 bg-gray-400"
                        style={{
                          textAlign: "center",
                          color: "white",
                          border: "1px solid black",
                        }}
                        key={index}
                      >
                        {item}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {initialValues.product.map((item, index) => (
                    <tr
                      style={{
                        textAlign: "center",
                        verticalAlign: "middle",
                      }}
                      key={index}
                    >
                      {/* Contador de productos ingresados */}
                      <td
                        className="p-0"
                        style={{
                          border: "1px solid black",
                          width: 150,
                        }}
                      >
                        {index + 1}{" "}
                        {/* Muestra el número de fila (1, 2, 3...) */}
                      </td>
                      <td
                        className="p-0"
                        style={{
                          border: "1px solid black",
                          width: 150,
                        }}
                      >
                        {item.name ?? ""}
                      </td>
                      <td
                        className="p-0"
                        style={{
                          border: "1px solid black",
                          width: 150,
                        }}
                      >
                        {item.price ?? ""}
                      </td>
                    </tr>
                  ))}
                  <tr>
                    <th
                      style={{
                        border: "1px solid black",
                        textAlign: "center",
                      }}
                      colSpan={2}
                    >
                      TOTAL
                    </th>
                    <th
                      style={{
                        border: "1px solid black",
                        textAlign: "center",
                      }}
                    >
                      {initialValues.product
                        .reduce(
                          (partialSum, facture) => partialSum + facture.price,
                          0
                        )
                        .toLocaleString("en-US")}
                    </th>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ReporteUnaVenta;
