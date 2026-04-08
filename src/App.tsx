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
import RoleManagement from './pages/user/RoleManagement';
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
                                <PermissionGate permission="view_analytics">
                                    <AnalyticalDashboard />
                                </PermissionGate>
                            } />
                            <Route path="/projects/statistics/details" element={
                                <PermissionGate permission="view_project">
                                    <ProjectStatisticsDetail />
                                </PermissionGate>
                            } />
                            <Route path="/users" element={
                                <PermissionGate permission="view_user">
                                    <UserList />
                                </PermissionGate>
                            } />
                            <Route path="/users/new" element={
                                <PermissionGate permission="add_user">
                                    <UserForm />
                                </PermissionGate>
                            } />
                            <Route path="/users/edit/:id" element={
                                <PermissionGate permission="change_user">
                                    <UserForm />
                                </PermissionGate>
                            } />
                            <Route path="/users/:id" element={
                                <PermissionGate permission="view_user">
                                    <UserDetail />
                                </PermissionGate>
                            } />
                            <Route path="/projects" element={
                                <PermissionGate permission="view_project">
                                    <ProjectList />
                                </PermissionGate>
                            } />
                            <Route path="/projects/new" element={
                                <PermissionGate permission="add_project">
                                    <ProjectForm />
                                </PermissionGate>
                            } />
                            <Route path="/projects/edit/:id" element={
                                <PermissionGate permission="change_project">
                                    <ProjectForm />
                                </PermissionGate>
                            } />
                            <Route path="/projects/:id" element={
                                <PermissionGate permission="view_project">
                                    <ProjectDetail />
                                </PermissionGate>
                            } />
                            <Route path="/teams" element={
                                <PermissionGate permission="view_team">
                                    <TeamList />
                                </PermissionGate>
                            } />
                            <Route path="/teams/new" element={
                                <PermissionGate permission="add_team">
                                    <TeamForm />
                                </PermissionGate>
                            } />
                            <Route path="/teams/edit/:id" element={
                                <PermissionGate permission="change_team">
                                    <TeamForm />
                                </PermissionGate>
                            } />
                            <Route path="/invoices/company-summary" element={
                                <PermissionGate permission="view_invoice">
                                    <InvoiceCompanyList />
                                </PermissionGate>
                            } />
                            <Route path="/invoices/new" element={
                                <PermissionGate permission="add_invoice">
                                    <InvoiceForm />
                                </PermissionGate>
                            } />
                            <Route path="/invoices/client/:clientId" element={
                                <PermissionGate permission="view_invoice">
                                    <InvoiceList />
                                </PermissionGate>
                            } />
                            <Route path="/invoices/client/:clientId/new" element={
                                <PermissionGate permission="add_invoice">
                                    <InvoiceForm />
                                </PermissionGate>
                            } />
                            <Route path="/invoices/client/:clientId/edit/:id" element={
                                <PermissionGate permission="change_invoice">
                                    <InvoiceForm />
                                </PermissionGate>
                            } />
                            <Route path="/invoices/client/:clientId/:id" element={
                                <PermissionGate permission="view_invoice">
                                    <InvoiceDetail />
                                </PermissionGate>
                            } />
                            <Route path="/activities" element={
                                <PermissionGate permission={['view_all_activities', 'view_own_activities']}>
                                    <ActivityList />
                                </PermissionGate>
                            } />
                            <Route path="/employees/:employeeId/activities" element={
                                <PermissionGate permission={['view_all_activities', 'view_own_activities']}>
                                    <ActivityList />
                                </PermissionGate>
                            } />
                            <Route path="/activities/new" element={
                                <PermissionGate permission={['add_employeedailyactivity', 'view_own_activities']}>
                                    <ActivityForm />
                                </PermissionGate>
                            } />
                            <Route path="/activities/edit/:id" element={
                                <PermissionGate permission={['change_employeedailyactivity', 'view_own_activities']}>
                                    <ActivityForm />
                                </PermissionGate>
                            } />
                            <Route path="/leaves" element={
                                <PermissionGate permission="view_employeeleave">
                                    <LeaveList />
                                </PermissionGate>
                            } />
                            <Route path="/leaves/new" element={
                                <PermissionGate permission="add_employeeleave">
                                    <LeaveForm />
                                </PermissionGate>
                            } />
                            <Route path="/leaves/edit/:id" element={
                                <PermissionGate permission="change_employeeleave">
                                    <LeaveForm />
                                </PermissionGate>
                            } />
                            <Route path="/salaries" element={
                                <PermissionGate permission="view_salary">
                                    <SalaryList />
                                </PermissionGate>
                            } />
                            <Route path="/salaries/new" element={
                                <PermissionGate permission="add_salary">
                                    <SalaryForm />
                                </PermissionGate>
                            } />
                            <Route path="/salaries/edit/:id" element={
                                <PermissionGate permission="change_salary">
                                    <SalaryForm />
                                </PermissionGate>
                            } />
                            <Route path="/user-salaries" element={
                                <PermissionGate permission="view_usersalary">
                                    <UserSalaryList />
                                </PermissionGate>
                            } />
                            <Route path="/user-salaries/new" element={
                                <PermissionGate permission="add_usersalary">
                                    <UserSalaryForm />
                                </PermissionGate>
                            } />
                            <Route path="/user-salaries/edit/:id" element={
                                <PermissionGate permission="change_usersalary">
                                    <UserSalaryForm />
                                </PermissionGate>
                            } />
                            <Route path="/attendance" element={
                                <PermissionGate permission="view_attendance">
                                    <AttendanceList />
                                </PermissionGate>
                            } />
                            <Route path="/attendance/new" element={
                                <PermissionGate permission="add_attendance">
                                    <AttendanceForm />
                                </PermissionGate>
                            } />
                            <Route path="/attendance/edit/:id" element={
                                <PermissionGate permission="change_attendance">
                                    <AttendanceForm />
                                </PermissionGate>
                            } />
                            <Route path="/other-incomes" element={
                                <PermissionGate permission="view_otherincome">
                                    <OtherIncomeList />
                                </PermissionGate>
                            } />
                            <Route path="/other-incomes/new" element={
                                <PermissionGate permission="add_otherincome">
                                    <OtherIncomeForm />
                                </PermissionGate>
                            } />
                            <Route path="/other-incomes/edit/:id" element={
                                <PermissionGate permission="change_otherincome">
                                    <OtherIncomeForm />
                                </PermissionGate>
                            } />
                            <Route path="/other-expenses" element={
                                <PermissionGate permission="view_otherexpense">
                                    <OtherExpenseList />
                                </PermissionGate>
                            } />
                            <Route path="/other-expenses/new" element={
                                <PermissionGate permission="add_otherexpense">
                                    <OtherExpenseForm />
                                </PermissionGate>
                            } />
                            <Route path="/other-expenses/edit/:id" element={
                                <PermissionGate permission="change_otherexpense">
                                    <OtherExpenseForm />
                                </PermissionGate>
                            } />
                            <Route path="/employees" element={
                                <PermissionGate permission="view_employee">
                                    <EmployeeList />
                                </PermissionGate>
                            } />
                            <Route path="/employees/new" element={
                                <PermissionGate permission="add_employee">
                                    <EmployeeForm />
                                </PermissionGate>
                            } />
                            <Route path="/employees/edit/:id" element={
                                <PermissionGate permission="change_employee">
                                    <EmployeeForm />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/servers" element={
                                <PermissionGate permission="view_projectserver">
                                    <ServerList />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/servers/new" element={
                                <PermissionGate permission="add_projectserver">
                                    <ServerForm />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/servers/edit/:id" element={
                                <PermissionGate permission="change_projectserver">
                                    <ServerForm />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/servers/:id" element={
                                <PermissionGate permission="view_projectserver">
                                    <ServerDetail />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/domains" element={
                                <PermissionGate permission="view_projectdomain">
                                    <DomainList />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/domains/new" element={
                                <PermissionGate permission="add_projectdomain">
                                    <DomainForm />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/domains/edit/:id" element={
                                <PermissionGate permission="change_projectdomain">
                                    <DomainForm />
                                </PermissionGate>
                            } />
                            <Route path="/infrastructure/domains/:id" element={
                                <PermissionGate permission="view_projectdomain">
                                    <DomainDetail />
                                </PermissionGate>
                            } />
                            <Route path="/reports" element={
                                <PermissionGate permission="view_reports">
                                    <ReportsPage />
                                </PermissionGate>
                            } />
                            <Route path="/profile" element={<ProfilePage />} />
                            <Route path="/employee-performance" element={
                                <PermissionGate permission={['view_all_employee_performance', 'view_own_employee_performance']}>
                                    <EmployeePerformance />
                                </PermissionGate>
                            } />
                            <Route path="/team-performance" element={
                                <PermissionGate permission={['view_teamperformance', 'view_all_team_performance', 'view_own_team_performance']}>
                                    <TeamPerformance />
                                </PermissionGate>
                            } />
                            <Route path="/company-profile" element={
                                <PermissionGate permission="view_companyprofile">
                                    <CompanyProfilePage />
                                </PermissionGate>
                            } />
                            <Route path="/company-profile/new" element={
                                <PermissionGate permission="add_companyprofile">
                                    <CompanyProfileForm />
                                </PermissionGate>
                            } />
                            <Route path="/company-profile/edit/:id" element={
                                <PermissionGate permission="change_companyprofile">
                                    <CompanyProfileForm />
                                </PermissionGate>
                            } />
                            <Route path="/advances/client/:clientId" element={<AdvanceList />} />
                            <Route path="/advances/client/:clientId/new" element={<AdvanceForm />} />
                            <Route path="/advances/client/:clientId/edit/:advanceId" element={<AdvanceForm />} />
                            <Route path="/invoices/client/:clientId/:invoiceId/payments" element={<InvoicePaymentList />} />
                            <Route path="/invoices/client/:clientId/:invoiceId/payments/new" element={<InvoicePaymentForm />} />
                            <Route path="/invoices/client/:clientId/:invoiceId/payments/edit/:paymentId" element={<InvoicePaymentForm />} />
                            <Route path="/roles" element={
                                <PermissionGate permission="view_role">
                                    <RoleManagement />
                                </PermissionGate>
                            } />
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

