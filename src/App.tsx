import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import LoginPage from './pages/login/LoginPage';
import AnalyticalDashboard from './pages/dashboard/AnalyticalDashboard';
import ProjectStatisticsDetail from './pages/dashboard/ProjectStatisticsDetail';
import Layout from './components/Layout';

const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
    const isAuthenticated = !!localStorage.getItem('access_token');
    return isAuthenticated ? <>{children || <Outlet />}</> : <Navigate to="/login" replace />;
};

import UserList from './pages/user/UserList';
import UserDetail from './pages/user/UserDetail';
import UserForm from './pages/user/UserForm';
import TeamPerformance from './pages/user/TeamPerformance';
import ProfilePage from './pages/user/ProfilePage';
import EmployeePerformance from './pages/user/EmployeePerformance';
import ProjectList from './pages/projects/ProjectList';
import ProjectDetail from './pages/projects/ProjectDetail';
import ProjectForm from './pages/projects/ProjectForm';
import TeamList from './pages/teams/TeamList';
import TeamForm from './pages/teams/TeamForm';
import InvoiceList from './pages/invoices/InvoiceList';
import InvoiceDetail from './pages/invoices/InvoiceDetail';
import InvoiceForm from './pages/invoices/InvoiceForm';
import InvoiceCompanyList from './pages/invoices/InvoiceCompanyList';
import CompanyProfilePage from './pages/companyProfile/CompanyProfilePage';
import CompanyProfileForm from './pages/companyProfile/CompanyProfileForm';
import AdvanceList from './pages/advances/AdvanceList';
import AdvanceForm from './pages/advances/AdvanceForm';
import InvoicePaymentList from './pages/invoices/InvoicePaymentList';
import InvoicePaymentForm from './pages/invoices/InvoicePaymentForm';
import ActivityList from './pages/activities/ActivityList';
import ActivityForm from './pages/activities/ActivityForm';
import LeaveList from './pages/leaves/LeaveList';
import LeaveForm from './pages/leaves/LeaveForm';
import SalaryList from './pages/salaries/SalaryList';
import SalaryForm from './pages/salaries/SalaryForm';
import UserSalaryList from './pages/userSalaries/UserSalaryList';
import UserSalaryForm from './pages/userSalaries/UserSalaryForm';
import AttendanceList from './pages/attendance/AttendanceList';
import AttendanceForm from './pages/attendance/AttendanceForm';
import OtherIncomeList from './pages/otherIncomes/OtherIncomeList';
import OtherIncomeForm from './pages/otherIncomes/OtherIncomeForm';
import OtherExpenseList from './pages/otherExpenses/OtherExpenseList';
import OtherExpenseForm from './pages/otherExpenses/OtherExpenseForm';
import EmployeeList from './pages/employees/EmployeeList';
import EmployeeForm from './pages/employees/EmployeeForm';
import ReportsPage from './pages/reports/ReportsPage';
import ServerList from './pages/infrastructure/ServerList';
import ServerForm from './pages/infrastructure/ServerForm';
import ServerDetail from './pages/infrastructure/ServerDetail';
import DomainList from './pages/infrastructure/DomainList';
import DomainForm from './pages/infrastructure/DomainForm';
import DomainDetail from './pages/infrastructure/DomainDetail';
import WelcomePage from './pages/welcome/WelcomePage';

import PermissionGate from './components/PermissionGate';
import { ThemeProvider } from './context/ThemeContext';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }
    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }
    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', color: 'red', background: 'white' }}>
                    <h1>Something went wrong.</h1>
                    <pre>{this.state.error?.toString()}</pre>
                    <pre>{this.state.error?.stack}</pre>
                </div>
            );
        }
        return this.props.children;
    }
}

function App() {
    return (
        <ErrorBoundary>
            <ThemeProvider>
                <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />

                    {/* Protected Routes Without Sidebar Layout */}
                    <Route element={<ProtectedRoute><Outlet /></ProtectedRoute>}>
                        <Route path="/welcome" element={<WelcomePage />} />
                    </Route>

                    {/* Protected Routes with Sidebar Layout */}
                    <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                        <Route path="/dashboard" element={
                            <PermissionGate path="/dashboard">
                                <AnalyticalDashboard />
                            </PermissionGate>
                        } />
                        <Route path="/projects/statistics/details" element={
                            <PermissionGate path="/dashboard">
                                <ProjectStatisticsDetail />
                            </PermissionGate>
                        } />
                        <Route path="/users" element={
                            <PermissionGate path="/users">
                                <UserList />
                            </PermissionGate>
                        } />
                        <Route path="/users/new" element={
                            <PermissionGate path="/users">
                                <UserForm />
                            </PermissionGate>
                        } />
                        <Route path="/users/edit/:id" element={
                            <PermissionGate path="/users">
                                <UserForm />
                            </PermissionGate>
                        } />
                        <Route path="/users/:id" element={
                            <PermissionGate path="/users">
                                <UserDetail />
                            </PermissionGate>
                        } />
                        <Route path="/projects" element={<ProjectList />} />
                        <Route path="/projects/new" element={<ProjectForm />} />
                        <Route path="/projects/edit/:id" element={<ProjectForm />} />
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/teams" element={
                            <PermissionGate path="/teams">
                                <TeamList />
                            </PermissionGate>
                        } />
                        <Route path="/teams/new" element={
                            <PermissionGate path="/teams">
                                <TeamForm />
                            </PermissionGate>
                        } />
                        <Route path="/teams/edit/:id" element={
                            <PermissionGate path="/teams">
                                <TeamForm />
                            </PermissionGate>
                        } />
                        <Route path="/invoices/company-summary" element={
                            <PermissionGate path="/invoices/company-summary">
                                <InvoiceCompanyList />
                            </PermissionGate>
                        } />
                        <Route path="/invoices/new" element={
                            <PermissionGate path="/invoices/company-summary">
                                <InvoiceForm />
                            </PermissionGate>
                        } />
                        <Route path="/invoices/client/:clientId" element={<InvoiceList />} />
                        <Route path="/invoices/client/:clientId/new" element={<InvoiceForm />} />
                        <Route path="/invoices/client/:clientId/edit/:id" element={<InvoiceForm />} />
                        <Route path="/invoices/client/:clientId/:id" element={<InvoiceDetail />} />
                        <Route path="/activities" element={<ActivityList />} />
                        <Route path="/employees/:employeeId/activities" element={<ActivityList />} />
                        <Route path="/activities/new" element={<ActivityForm />} />
                        <Route path="/activities/edit/:id" element={<ActivityForm />} />
                        <Route path="/leaves" element={<LeaveList />} />
                        <Route path="/leaves/new" element={<LeaveForm />} />
                        <Route path="/leaves/edit/:id" element={<LeaveForm />} />
                        <Route path="/salaries" element={
                            <PermissionGate path="/salaries">
                                <SalaryList />
                            </PermissionGate>
                        } />
                        <Route path="/salaries/new" element={
                            <PermissionGate path="/salaries">
                                <SalaryForm />
                            </PermissionGate>
                        } />
                        <Route path="/salaries/edit/:id" element={
                            <PermissionGate path="/salaries">
                                <SalaryForm />
                            </PermissionGate>
                        } />
                        <Route path="/user-salaries" element={
                            <PermissionGate path="/user-salaries">
                                <UserSalaryList />
                            </PermissionGate>
                        } />
                        <Route path="/user-salaries/new" element={
                            <PermissionGate path="/user-salaries">
                                <UserSalaryForm />
                            </PermissionGate>
                        } />
                        <Route path="/user-salaries/edit/:id" element={
                            <PermissionGate path="/user-salaries">
                                <UserSalaryForm />
                            </PermissionGate>
                        } />
                        <Route path="/attendance" element={<AttendanceList />} />
                        <Route path="/attendance/new" element={<AttendanceForm />} />
                        <Route path="/attendance/edit/:id" element={<AttendanceForm />} />
                        <Route path="/other-incomes" element={
                            <PermissionGate path="/other-incomes">
                                <OtherIncomeList />
                            </PermissionGate>
                        } />
                        <Route path="/other-incomes/new" element={
                            <PermissionGate path="/other-incomes">
                                <OtherIncomeForm />
                            </PermissionGate>
                        } />
                        <Route path="/other-incomes/edit/:id" element={
                            <PermissionGate path="/other-incomes">
                                <OtherIncomeForm />
                            </PermissionGate>
                        } />
                        <Route path="/other-expenses" element={
                            <PermissionGate path="/other-expenses">
                                <OtherExpenseList />
                            </PermissionGate>
                        } />
                        <Route path="/other-expenses/new" element={
                            <PermissionGate path="/other-expenses">
                                <OtherExpenseForm />
                            </PermissionGate>
                        } />
                        <Route path="/other-expenses/edit/:id" element={
                            <PermissionGate path="/other-expenses">
                                <OtherExpenseForm />
                            </PermissionGate>
                        } />
                        <Route path="/employees" element={
                            <PermissionGate path="/employees">
                                <EmployeeList />
                            </PermissionGate>
                        } />
                        <Route path="/employees/new" element={
                            <PermissionGate path="/employees">
                                <EmployeeForm />
                            </PermissionGate>
                        } />
                        <Route path="/employees/edit/:id" element={
                            <PermissionGate path="/employees">
                                <EmployeeForm />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/servers" element={
                            <PermissionGate path="/infrastructure/servers">
                                <ServerList />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/servers/new" element={
                            <PermissionGate path="/infrastructure/servers">
                                <ServerForm />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/servers/edit/:id" element={
                            <PermissionGate path="/infrastructure/servers">
                                <ServerForm />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/servers/:id" element={
                            <PermissionGate path="/infrastructure/servers">
                                <ServerDetail />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/domains" element={
                            <PermissionGate path="/infrastructure/domains">
                                <DomainList />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/domains/new" element={
                            <PermissionGate path="/infrastructure/domains">
                                <DomainForm />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/domains/edit/:id" element={
                            <PermissionGate path="/infrastructure/domains">
                                <DomainForm />
                            </PermissionGate>
                        } />
                        <Route path="/infrastructure/domains/:id" element={
                            <PermissionGate path="/infrastructure/domains">
                                <DomainDetail />
                            </PermissionGate>
                        } />
                        <Route path="/reports" element={
                            <PermissionGate path="/reports">
                                <ReportsPage />
                            </PermissionGate>
                        } />
                        <Route path="/profile" element={<ProfilePage />} />
                        <Route path="/employee-performance" element={<EmployeePerformance />} />
                        <Route path="/team-performance" element={
                            <PermissionGate path="/team-performance">
                                <TeamPerformance />
                            </PermissionGate>
                        } />
                        <Route path="/company-profile" element={
                            <PermissionGate path="/company-profile">
                                <CompanyProfilePage />
                            </PermissionGate>
                        } />
                        <Route path="/company-profile/new" element={
                            <PermissionGate path="/company-profile">
                                <CompanyProfileForm />
                            </PermissionGate>
                        } />
                        <Route path="/company-profile/edit/:id" element={
                            <PermissionGate path="/company-profile">
                                <CompanyProfileForm />
                            </PermissionGate>
                        } />
                        <Route path="/advances/client/:clientId" element={<AdvanceList />} />
                        <Route path="/advances/client/:clientId/new" element={<AdvanceForm />} />
                        <Route path="/advances/client/:clientId/edit/:advanceId" element={<AdvanceForm />} />
                        <Route path="/invoices/client/:clientId/:invoiceId/payments" element={<InvoicePaymentList />} />
                        <Route path="/invoices/client/:clientId/:invoiceId/payments/new" element={<InvoicePaymentForm />} />
                        <Route path="/invoices/client/:clientId/:invoiceId/payments/edit/:paymentId" element={<InvoicePaymentForm />} />
                    </Route>

                    <Route path="/" element={<Navigate to="/login" replace />} />
                    <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
            </BrowserRouter>
        </ThemeProvider>
    </ErrorBoundary>
);
}

export default App;

