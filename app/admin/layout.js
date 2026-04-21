import AdminLayoutClient from './components/AdminLayoutClient';

export const metadata = {
  title: "Quản trị VietTravel Luxury",
  description: "Hệ thống quản lý tour du lịch",
};

export default function AdminLayout({ children }) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
