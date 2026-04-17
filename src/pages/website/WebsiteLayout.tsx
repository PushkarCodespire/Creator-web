import { Outlet } from 'react-router-dom';
import { WebsiteNav } from './components/WebsiteNav';
import { WebsiteFooter } from './components/WebsiteFooter';
import './website-globals.css';

export default function WebsiteLayout() {
  return (
    <div className="website-shell">
      <WebsiteNav />
      <Outlet />
      <WebsiteFooter />
    </div>
  );
}
