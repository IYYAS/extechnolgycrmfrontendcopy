
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Users from './pages/Users';
import UserForm from './pages/UserForm';
import UserProfile from './pages/UserProfile';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import DailyActivities from './pages/DailyActivities';
import DailyActivityForm from './pages/DailyActivityForm';
import EmployeeActivities from './pages/EmployeeActivities';
import EmployeeProjects from './pages/EmployeeProjects';
import Clients from './pages/Clients';
import ClientForm from './pages/ClientForm';
import Billing from './pages/Billing';
import InvoiceDetail from './pages/InvoiceDetail';
import ProjectInvoices from './pages/ProjectInvoices';
import InvoicePayments from './pages/InvoicePayments';
import RecentPayments from './pages/RecentPayments';
import InvoiceForm from './pages/InvoiceForm';
import ProjectTimeline from './pages/ProjectTimeline';
import Domains from './pages/Domains';
import Servers from './pages/Servers';
import Login from './pages/Login';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        {/* Timeline and Assets - Admin, SuperAdmin, Developer, and Billing */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser', 'Developer', 'Billing']} />}>
          <Route path="/projects/timeline" element={<Layout><ProjectTimeline /></Layout>} />
          <Route path="/assets/domains" element={<Layout><Domains /></Layout>} />
          <Route path="/assets/servers" element={<Layout><Servers /></Layout>} />
        </Route>

        {/* Root Dashboard - SuperAdmin and Admin only */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser']} />}>
          <Route path="/" element={<Layout><Dashboard /></Layout>} />
        </Route>

        {/* Employees - SuperAdmin and Admin only */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser']} />}>
          <Route path="/employees" element={<Layout><Employees /></Layout>} />
          <Route path="/employees/:id/activities" element={<Layout><EmployeeActivities /></Layout>} />
          <Route path="/employees/:id/projects" element={<Layout><EmployeeProjects /></Layout>} />
        </Route>

        {/* Users - SuperAdmin and Admin only (can manage users) */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser']} />}>
          <Route path="/users" element={<Layout><Users /></Layout>} />
          <Route path="/users/add" element={<Layout><UserForm /></Layout>} />
          <Route path="/users/edit/:id" element={<Layout><UserForm /></Layout>} />
        </Route>

        {/* Clients - SuperAdmin and Admin only */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser']} />}>
          <Route path="/clients" element={<Layout><Clients /></Layout>} />
          <Route path="/clients/add" element={<Layout><ClientForm /></Layout>} />
          <Route path="/clients/edit/:id" element={<Layout><ClientForm /></Layout>} />
        </Route>

        {/* Projects - All authenticated users */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser', 'Billing']} />}>
          <Route path="/billing" element={<Layout><Billing /></Layout>} />
          <Route path="/billing/recent-payments" element={<Layout><RecentPayments /></Layout>} />
          <Route path="/billing/invoice/:id" element={<Layout><InvoiceDetail /></Layout>} />
          <Route path="/billing/project/:projectId/invoices" element={<Layout><ProjectInvoices /></Layout>} />
          <Route path="/billing/project/:projectId/invoices/create" element={<Layout><InvoiceForm /></Layout>} />
          <Route path="/billing/project/:projectId/invoices/edit/:invoiceId" element={<Layout><InvoiceForm /></Layout>} />
          <Route path="/billing/invoice/:invoiceId/payments" element={<Layout><InvoicePayments /></Layout>} />
        </Route>

        {/* Projects - Admin, SuperAdmin, standard workers, and Billing. */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser', 'Developer', 'Billing']} />}>
          <Route path="/projects" element={<Layout><Projects /></Layout>} />
          <Route path="/projects/view/:id" element={<Layout><ProjectForm /></Layout>} />
          <Route path="/projects/add" element={<Layout><ProjectForm /></Layout>} />
          <Route path="/projects/edit/:id" element={<Layout><ProjectForm /></Layout>} />
        </Route>

        {/* Daily Activities - Admin, SuperAdmin, and standard workers (e.g. Developer) only. */}
        <Route element={<ProtectedRoute requiredRoles={['admin', 'superuser', 'Developer']} />}>
          <Route path="/daily-activities" element={<Layout><DailyActivities /></Layout>} />
          <Route path="/daily-activities/add" element={<Layout><DailyActivityForm /></Layout>} />
          <Route path="/daily-activities/edit/:id" element={<Layout><DailyActivityForm /></Layout>} />
        </Route>

        {/* User Profile - All authenticated users */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Layout><UserProfile /></Layout>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
