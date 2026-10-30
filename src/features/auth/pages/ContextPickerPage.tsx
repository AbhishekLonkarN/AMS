import { ContextPickerView } from '../components/ContextPickerView';
import { useContextPicker } from '../hooks/useContextPicker';

export function ContextPickerPage() {
  const groups = useContextPicker();
  return <ContextPickerView groups={groups} />;
}
