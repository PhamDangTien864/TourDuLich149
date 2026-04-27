import AdminLayout from './components/AdminLayout';

export const metadata = {
  title: "Quản trị VietTravel Luxury",
  description: "Hệ thống quản lý tour du lịch",
};

export default function AdminRootLayout({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
