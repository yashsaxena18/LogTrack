import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./layouts/MainLayout";

import Dashboard from "./pages/Dashboard";
import Shipments from "./pages/Shipments";
import ShipmentDetails from "./pages/ShipmentDetails";
import Orders from "./pages/Orders";
import OrderDetails from "./pages/OrderDetails";
import Vehicles from "./pages/Vehicles";
import VehicleDetails from "./pages/VehicleDetails";
import Drivers from "./pages/Drivers";
import DriverDetails from "./pages/DriverDetails";
import Warehouses from "./pages/Warehouses";
import WarehouseDetails from "./pages/WarehouseDetails";
import Incidents from "./pages/Incidents";
import IncidentDetails from "./pages/IncidentDetails";
import Analytics from "./pages/Analytics";
import ETLMonitoring from "./pages/ETLMonitoring";
import DataIngestion from "./pages/DataIngestion";

function App() {
  return (
    <BrowserRouter>
      <MainLayout>
        <Routes>
          {/* DASHBOARD */}

          <Route path="/" element={<Dashboard />} />

          {/* SHIPMENTS */}

          <Route path="/shipments" element={<Shipments />} />

          {/* SHIPMENT DETAILS */}

          <Route path="/shipments/:shipmentId" element={<ShipmentDetails />} />

          {/* ORDERS */}
          <Route path="/orders" element={<Orders />} />
          {/* ORDER DETAILS */}
          <Route path="/orders/:orderId" element={<OrderDetails />} />
          {/* VEHICLES */}
          <Route path="/vehicles" element={<Vehicles />} />
          {/* VEHICLE DETAILS */}
          <Route path="/vehicles/:vehicleId" element={<VehicleDetails />} />

          {/* DRIVERS */}
          <Route path="/drivers" element={<Drivers />} />
          {/* DRIVER DETAILS */}
          <Route path="/drivers/:driverId" element={<DriverDetails />} />

          {/* WAREHOUSES */}
          <Route path="/warehouses" element={<Warehouses />} />

          {/* WAREHOUSE DETAILS */}
          <Route
            path="/warehouses/:warehouseId"
            element={<WarehouseDetails />}
          />

          {/* INCIDENTS */}
          <Route path="/incidents" element={<Incidents />} />
          {/* INCIDENT DETAILS */}
          <Route path="/incidents/:incidentId" element={<IncidentDetails />} />

          {/* ANALYTICS */}
          <Route path="/analytics" element={<Analytics />} />


          {/* ETL MONITORING */}
          <Route path="/etl-monitoring" element={<ETLMonitoring />} />

          {/* DATA INGESTION */}
          <Route path="/data-ingestion" element={<DataIngestion />} />


        </Routes>
      </MainLayout>
    </BrowserRouter>
  );
}

export default App;
