import type { DemoUserOption } from '@/components/layout';
import { initials } from '@/utils/string.utils';
import { LOGIN_LABELS } from '../constants/auth.constants';
import styles from './DemoUserList.module.css';

interface DemoUserListProps {
  users: DemoUserOption[];
  onSelect: (userId: string) => void;
}

export function DemoUserList({ users, onSelect }: DemoUserListProps) {
  return (
    <div className={styles.wrap}>
      <div className={styles.divider}>{LOGIN_LABELS.demoTitle}</div>
      <ul className={styles.grid}>
        {users.map((user) => (
          <li key={user.userId}>
            <button type="button" className={styles.option} onClick={() => onSelect(user.userId)}>
              <span className={styles.avatar}>{initials(user.name)}</span>
              <span className={styles.text}>
                <span className={styles.role}>{user.roleLabel}</span>
                <span className={styles.name}>{user.name}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className={styles.hint}>{LOGIN_LABELS.demoHint}</p>
    </div>
  );
}
