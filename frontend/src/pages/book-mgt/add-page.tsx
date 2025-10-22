import { useAuthCheck } from 'src/routes/hooks/use-auth-check';

import { AddOverview } from './components/add-overview';

export default function AddPage() {
  useAuthCheck();

  return <AddOverview />;
}
