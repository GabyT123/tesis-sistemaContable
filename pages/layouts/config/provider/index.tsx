/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import LoadingContainer from "../../../components/loading_container";
import TreeTable, { ColumnData } from "../../../components/tree_table";
import { FactureProvider } from "../../../../model";
import { useAuth } from "../../../../lib/hooks/use_auth";
import HttpClient from "../../../../lib/utils/http_client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ProvidersPanel = () => {
  const { auth } = useAuth();
  const [loading, setLoading] = useState<boolean>(true);
  const [tableData, setTableData] = useState<Array<FactureProvider>>([]);

  const loadData = async () => {
    setLoading(true);
    const response = await HttpClient(
      "/api/provider",
      "GET",
      auth.userName,
      auth.role
    );
    const providers: Array<FactureProvider> = response.data ?? [];
    setTableData(providers);
    setLoading(false);
  };

  const updateRow = async (data: any) => {
    const response = await HttpClient(
      "/api/provider",
      "PUT",
      auth.userName,
      auth.role,
      data
    );
    if (response.success) toast.success("Proveedor Actualizado");
    else toast.warning("Error al actualizar!");
    await loadData();
  };

  const removeRow = async (data: any) => {
    const response = await HttpClient(
      "/api/provider/" + data.id,
      "DELETE",
      auth.userName,
      auth.role
    );
    if (response.success) toast.success("Proveedor Eliminado");
    else toast.success("Proveedor Eliminado");
    await loadData();
  };

  const insertRow = async (data: any) => {
    const response = await HttpClient(
      "/api/provider",
      "POST",
      auth.userName,
      auth.role,
      data
    );
    if (response.success) toast.success("Nuevo Proveedor Ingresado");
    else toast.warning("Error al insertar!");
    await loadData();
  };

  const exportarReportePDF = () => {
    if (tableData.length === 0) {
      toast.warning("No hay datos de proveedores para exportar.");
      return;
    }

    const doc = new jsPDF();
    doc.text("Reporte de Proveedores", 14, 10);

    const headers = [["#", "Nombre del Proveedor", "Email"]];
    const data = tableData.map((item, index) => [
      index + 1,
      item.name,
      item.email,
    ]);

    autoTable(doc, {
      head: headers,
      body: data,
      startY: 20,
      styles: { fontSize: 10, cellPadding: 2 },
      headStyles: { fillColor: [0, 112, 192], textColor: [255, 255, 255] }, // Encabezado en azul
      alternateRowStyles: { fillColor: [240, 240, 240] }, // Filas alternas en gris
    });

    doc.save("Reporte_Proveedores.pdf");
    toast.success("Reporte de proveedores exportado en PDF con éxito!");
  };

  useEffect(() => {
    loadData();
  }, []);

  const columns: ColumnData[] = [
    { dataField: "name", caption: "Nombre del Proveedor" },
    { dataField: "email", caption: "Email del proveedor" },
  ];

  return (
    <div style={{ padding: "40px 0" }}>
      <button
        className="text-center bg-transparent hover:bg-blue-500 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded-full text-sm"
        onClick={exportarReportePDF}
      >
        Reporte de Proveedores (PDF)
      </button>

      <LoadingContainer visible={loading} miniVersion>
        <TreeTable
          dataSource={tableData}
          columns={columns}
          defaultActions={{
            updating: true,
            deleting: true,
            adding: true,
          }}
          onRow={{
            updated: updateRow,
            removed: removeRow,
            inserted: insertRow,
          }}
          searchPanel={true}
          colors={{ headerBackground: "#F8F9F9", headerColor: "#CD5C5C" }}
          paging
          showNavigationButtons
          showNavigationInfo
          pageSize={15}
          infoText={(actual, total, items) =>
            `Página ${actual} de ${total} (${items} proveedores)`
          }
        />
      </LoadingContainer>
    </div>
  );
};

export default ProvidersPanel;
