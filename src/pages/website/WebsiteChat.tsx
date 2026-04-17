import { useParams, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { ChatUI } from './components/ChatUI';
import './website-globals.css';

/**
 * Full-screen dark chat — requires authentication.
 * Route: /website-chat/:creatorId
 * creatorId must be a real database creator ID (not a slug).
 */
export default function WebsiteChat() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  if (!creatorId) return <Navigate to="/" replace />;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="website-shell" style={{ background: '#1a1a1a' }}>
      <ChatUI creatorId={creatorId} />
    </div>
  );
}
