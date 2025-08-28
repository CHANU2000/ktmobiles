import {BrowserRouter as Router,Routes,Route} from "react-router-dom";
import Home from './pages/home/Home';
import Navbar from "./components/navbar/Navbar";
import Login from './pages/login/Login';
import Products from './pages/products/Products';
import Protectedroute from "./Protectedroute";
import Suppliers from './pages/supplier/Suppliers';
import ServiceHistory from "./pages/services/ServiceHistory";
import New from "./pages/new/New";
import Orders from "./pages/orders/Orders";
import Customers from "./pages/customer/Customers";
import CustomerReceipt from "./pages/cusreceipt/CustomerReceipt";
import Sales from "./pages/sales/Sales";
import Stock from "./pages/stock/Stock";
import StockSummary from "./pages/stock/StockSummary";
import PrintView from "./pages/printview/PrintView";
import SalesHistory from "./pages/sales/SalesHistory";
import OtherCost from "./pages/othercost/OtherCost";
import FinalAccount from "./pages/account/FinalAccount";
import SalesReturn from "./pages/sales/SalesReturn";

const App=()=> {


  const isAdmin=true;
  return(
  <Router>
<Routes>
  <Route path="/" element={<Login/>}/>

  <Route path="/home" element={
    <Protectedroute isAdmin={isAdmin}>
      <Home/>
      
    </Protectedroute>
}/>
<Route path="/" element={<Navbar/>}/>
<Route path="/products" element={<Products/>}/>
<Route path="/supplier" element={<Suppliers/>}/>
<Route path="/service-history" element={<ServiceHistory/>}/>
<Route path="/customer" element={<Customers/>}/>
<Route path="/new" element={<New/>}/>
<Route path="/orders" element={<Orders/>}/>
<Route path="cusreceipt" element={<CustomerReceipt/>}/>
<Route path="/sales" element={<Sales/>}/>
<Route path="/sales-history" element={<SalesHistory />} />
<Route path="/stock" element={<Stock/>}/>
<Route path="/stocks/summary" element={<StockSummary/>}/>
 <Route path="/print/:id" element={<PrintView />} />
 <Route path="/other-costs" element={<OtherCost/>}/>
 <Route path="/final-account" element={<FinalAccount/>}/>
 <Route path="/sales-return" element={<SalesReturn/>}/>

</Routes>
  </Router>
  )
  
    }


export default App;
