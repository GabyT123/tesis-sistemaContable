/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { useAuth } from "../lib/hooks/use_auth";
import { Product, ResponseData } from "../model";
import Sidebar from "../pages/components/sidebar";
import LoadingContainer from "../pages/components/loading_container";
import TreeTable, { ColumnData } from "../pages/components/tree_table";
import { Button } from "react-bootstrap";
import { CheckPermissions } from "../lib/utils/check_permissions";
import HttpClient from "../lib/utils/http_client";
import { toast } from "react-toastify";
import ProductModal from "../pages/components/modals/productModal";
import Router from "next/router";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const InventarioPage = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<Array<Product>>([]);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/product",
      "GET",
      auth.userName,
      auth.role
    );
    if (response.success) {
      setTableData(response.data);
    } else {
      toast.warning(response.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Función para exportar el reporte de inventario en PDF
  const exportarReportePDF = () => {
    if (tableData.length === 0) {
      toast.warning("No hay datos en el inventario para exportar.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Reporte de Inventario", 14, 10);

    const headers = [
      [
        "#",
        "Nombre del Producto",
        "Precio (USD)",
        "Stock Disponible",
        "Descripción",
        "Categoría",
      ],
    ];

    const data = tableData.map((item, index) => [
      index + 1,
      item.name,
      `$${item.price}`,
      item.stock,
      item.description,
      item.category,
    ]);

    // Aquí usamos autoTable con la importación correcta
    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [220, 53, 69], textColor: [255, 255, 255] }, // Encabezado en rojo
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Filas alternas en gris
    });

    doc.save("Reporte_Inventario.pdf");
    toast.success("Reporte de inventario exportado en PDF con éxito!");
  };

  const showModal = () => setModalVisible(true);
  const hideModal = async () => {
    if (editingProduct != null) setEditingProduct(null);
    setModalVisible(false);
    await loadData();
  };

  return (
    <>
      <title>Inventario de productos</title>
      <div className="flex h-full">
        <div className="md:w-1/6 max-w-none">
          <Sidebar />
        </div>
        <div className="w-12/12 md:w-5/6 flex justify-center">
          <div className="w-12/12 bg-white my-14 mx-8 p-5">
            <h2 className="text-2xl text-center mt-10 font-bold">
              Inventario de productos
            </h2>

            <button
              className="text-center bg-transparent hover:bg-red-500 text-red-500 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded-full text-sm"
              onClick={showModal}
            >
              Agregar Producto
            </button>

            <button
              className="ml-2 text-center bg-transparent hover:bg-blue-500 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full text-sm"
              onClick={exportarReportePDF}
            >
              Reporte de Inventario (PDF)
            </button>

            <LoadingContainer visible={loading} miniVersion>
              <TreeTable
                keyExpr="id"
                dataSource={tableData}
                columns={[
                  {
                    dataField: "name",
                    caption: "Nombre",
                    alignment: "center",
                    cssClass: "bold",
                  },
                  {
                    dataField: "price",
                    caption: "Precio",
                    alignment: "center",
                    cssClass: "bold",
                  },
                  {
                    dataField: "stock",
                    caption: "Inventario",
                    alignment: "center",
                    cssClass: "bold",
                  },
                  {
                    dataField: "description",
                    caption: "Descripción",
                    alignment: "center",
                    cssClass: "bold",
                  },
                  {
                    dataField: "category",
                    caption: "Categoría",
                    alignment: "center",
                    cssClass: "bold",
                  },
                ]}
              />
            </LoadingContainer>
          </div>
        </div>
      </div>
      <ProductModal
        visible={modalVisible}
        close={hideModal}
        initialData={editingProduct}
        onDone={async (newUser: Product) => {
          const response: ResponseData =
            editingProduct == null
              ? await HttpClient(
                  "/api/product",
                  "POST",
                  auth.userName,
                  auth.role,
                  newUser
                )
              : await HttpClient(
                  "/api/product",
                  "PUT",
                  auth.userName,
                  auth.role,
                  newUser
                );
          if (response.success) {
            toast.success(
              editingProduct == null
                ? "Producto creado!"
                : "Producto actualizado!"
            );
          } else {
            toast.warning(response.message);
          }
        }}
      />
    </>
  );
};

export default InventarioPage;
