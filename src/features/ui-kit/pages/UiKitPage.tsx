import { UiKitView } from '../components/UiKitView';
import { useUiKit } from '../hooks/useUiKit';

export function UiKitPage() {
  const vm = useUiKit();
  return <UiKitView {...vm} />;
}
